import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("driver"),
  status: text("status").notNull().default("pending"),
  isApproved: boolean("is_approved").notNull().default(false),
  fullName: text("full_name"),
  idNumber: text("id_number"),
  licenseNumber: text("license_number"),
  idDocumentUrl: text("id_document_url"),
  licenseDocumentUrl: text("license_document_url"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companyMappings = pgTable("company_mappings", {
  id: serial("id").primaryKey(),
  vehicleType: text("vehicle_type").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  companyName: text("company_name").notNull(),
  companyNameAr: text("company_name_ar").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  plateNumber: text("plate_number").notNull(),
  registrationUrl: text("registration_url"),
  photoUrls: json("photo_urls").$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  name: text("name").notNull(),
  idNumber: text("id_number").notNull(),
  nationality: text("nationality").notNull(),
});

export const operationOrders = pgTable("operation_orders", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  vehicleId: integer("vehicle_id"),  
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  visaType: text("visa_type").notNull(),
  tripNumber: text("trip_number").notNull(),
  qrCode: text("qr_code"),
  pdfUrl: text("pdf_url"),
  status: text("status").notNull().default("active"), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompanyMappingSchema = createInsertSchema(companyMappings).pick({
  vehicleType: true,
  vehicleModel: true,
  companyName: true,
  companyNameAr: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  idNumber: true,
  licenseNumber: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  type: true,
  model: true,
  year: true,
  plateNumber: true,
});

export const insertPassengerSchema = createInsertSchema(passengers).pick({
  name: true,
  idNumber: true,
  nationality: true,
});

export const insertOperationOrderSchema = createInsertSchema(operationOrders)
  .pick({
    fromCity: true,
    toCity: true,
    departureTime: true,
    visaType: true,
    tripNumber: true,
  })
  .extend({
    departureTime: z.string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
      })
      .transform((val) => new Date(val)),
    passengers: z.array(insertPassengerSchema)
      .min(1, "At least one passenger is required")
      .max(12, "Maximum 12 passengers allowed")
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type OperationOrder = typeof operationOrders.$inferSelect;
export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type CompanyMapping = typeof companyMappings.$inferSelect;
export type InsertCompanyMapping = z.infer<typeof insertCompanyMappingSchema>;