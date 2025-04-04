import { OperationOrder, User } from "@shared/schema";
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';
import { spawn } from 'child_process';
import { promisify } from 'util';

export async function generateOrderPDF(order: OperationOrder, driver: User): Promise<string> {
  try {
    console.log('Starting PDF generation for order:', order.id);

    // Get vehicle information
    const vehicle = await storage.getVehicleByOrder(order.id);
    console.log('Raw vehicle information:', vehicle);

    // Validate vehicle type/model for template selection
    const vehicleType = (vehicle?.type || '').toLowerCase().trim();
    const vehicleModel = (vehicle?.model || '').toLowerCase().trim();

    // Log vehicle information for debugging
    console.log('Processed vehicle info for template:', {
      vehicleType,
      vehicleModel,
      isHyundaiStaria: vehicleType === 'hyundai' && vehicleModel === 'staria'
    });

    // Get passengers for this order
    const passengers = await storage.getPassengersByOrder(order.id);

    // Format date
    const dateStr = new Date(order.departureTime).toLocaleString('ar-SA', {
      timeZone: 'Asia/Riyadh',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Prepare data for Python script
    const data = {
      date: dateStr,
      from_city: order.fromCity,
      to_city: order.toCity,
      visa_type: order.visaType,
      trip_number: order.tripNumber,
      driver_name: driver.fullName,
      driver_id: driver.idNumber,
      license_number: driver.licenseNumber,
      main_passenger: passengers[0]?.name || '',
      passengers: passengers.map(p => ({
        name: p.name,
        id_number: p.idNumber,
        nationality: p.nationality
      })),
      vehicle_type: vehicleType,
      vehicle_model: vehicleModel
    };

    const pdfFileName = `order_${order.id}_${Date.now()}.pdf`;
    const pdfPath = path.join(process.cwd(), 'uploads', pdfFileName);
    console.log('PDF will be generated at:', pdfPath);

    // Write data to temporary JSON file
    const tempDataPath = path.join(process.cwd(), 'uploads', `temp_${Date.now()}.json`);
    await promisify(fs.writeFile)(tempDataPath, JSON.stringify(data));

    // Run Python script
    await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'server/utils/pdf_generator.py'),
        tempDataPath,
        pdfPath
      ], {
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV
        }
      });

      pythonProcess.stdout.on('data', (data) => {
        console.log('Python script output:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Python script error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        fs.unlink(tempDataPath, () => {});

        if (code === 0) {
          if (fs.existsSync(pdfPath)) {
            console.log('PDF generated successfully at:', pdfPath);
            resolve(null);
          } else {
            reject(new Error('PDF file was not created'));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });

    return pdfFileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
