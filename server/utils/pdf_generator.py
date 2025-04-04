import sys
import json
import logging
from pathlib import Path
import qrcode
from io import BytesIO
import base64
from jinja2 import Template, FileSystemLoader, Environment
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import os
import shutil
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache font configuration
FONT_CONFIG = FontConfiguration()

@lru_cache(maxsize=1)
def get_template_dir():
    """Get and cache template directory path"""
    return Path(__file__).parent / 'pdf_templates'

@lru_cache(maxsize=1)
def get_template_env():
    """Get and cache Jinja2 environment"""
    template_dir = get_template_dir()
    return Environment(loader=FileSystemLoader(template_dir))

def get_replit_url():
    """Get the correct Replit URL for the current environment"""
    try:
        if os.getenv('NODE_ENV') == 'production':
            return "https://operit.replit.app"
        replit_domain = os.getenv('REPLIT_DOMAIN')
        repl_id = os.getenv('REPL_ID')
        repl_slug = os.getenv('REPL_SLUG')
        if replit_domain:
            return f"https://{replit_domain}"
        elif repl_slug and repl_id:
            return f"https://{repl_slug}.id.repl.co"
        return "http://localhost:5000"
    except Exception as e:
        logger.error(f"Error getting Replit URL: {str(e)}")
        return "http://localhost:5000"

@lru_cache(maxsize=100)
def generate_qr_code(pdf_url):
    """Generate and cache QR code for PDF URL"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(pdf_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{qr_base64}"
    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        raise

def setup_template_assets():
    """Setup template assets including background image"""
    try:
        template_dir = get_template_dir()
        bg_image_source = Path(__file__).parent.parent.parent / 'attached_assets' / 'Screenshot 2025-03-26 at 8.03.07 AM.png'
        bg_image_dest = template_dir / 'lightning_road_bg.png'

        if bg_image_source.exists() and not bg_image_dest.exists():
            shutil.copy(bg_image_source, bg_image_dest)

        return template_dir
    except Exception as e:
        logger.error(f"Error setting up template assets: {str(e)}")
        raise

def render_pdf(data, qr_code_base64, output_path):
    """Generate PDF using the standard template with optimized performance"""
    try:
        # Get cached environment and template
        env = get_template_env()
        template = env.get_template('transport_contract.html')

        # Render template
        html_content = template.render(
            date=data['date'],
            main_passenger=data['main_passenger'],
            from_city=data['from_city'],
            to_city=data['to_city'],
            driver_name=data['driver_name'],
            driver_id=data['driver_id'],
            license_number=data['license_number'],
            trip_number=data['trip_number'],
            visa_type=data['visa_type'],
            passengers=data['passengers'],
            qr_code=qr_code_base64
        )

        # Create PDF with background image and cached font config
        HTML(string=html_content).write_pdf(
            output_path,
            font_config=FONT_CONFIG,
            presentational_hints=True,
            optimize_size=('fonts', 'images')
        )

    except Exception as e:
        logger.error(f"Error in PDF generation: {str(e)}")
        raise

def generate_pdf(data_path, output_path):
    """Main PDF generation function with optimized performance"""
    try:
        # Ensure template assets are set up
        setup_template_assets()

        # Load data
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Generate QR code
        pdf_filename = Path(output_path).name
        base_url = get_replit_url()
        pdf_url = f"{base_url}/uploads/{pdf_filename}"
        qr_code_base64 = generate_qr_code(pdf_url)

        # Generate PDF
        render_pdf(data, qr_code_base64, output_path)
        return pdf_filename

    except Exception as e:
        logger.error(f"Error in PDF generation process: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 3:
        logger.error("Usage: python pdf_generator.py <data_path> <output_path>")
        sys.exit(1)

    try:
        data_path = sys.argv[1]
        output_path = sys.argv[2]
        generate_pdf(data_path, output_path)
    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")
        sys.exit(1)