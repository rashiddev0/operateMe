<?php
require_once __DIR__ . '/vendor/autoload.php';

use Mpdf\Mpdf;

function generatePDF($data) {
    // Configure mPDF for RTL and Arabic
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'default_font' => 'arial',
        'default_font_size' => 10,
        'margin_left' => 20,
        'margin_right' => 20,
        'margin_top' => 20,
        'margin_bottom' => 20,
        'margin_header' => 0,
        'margin_footer' => 0,
        'direction' => 'rtl'
    ]);

    // HTML template with RTL and Arabic support
    $html = '
    <html dir="rtl">
    <head>
        <style>
            body { font-family: arial; }
            .title { font-size: 16pt; text-align: center; margin-bottom: 20px; }
            .agreement { margin-bottom: 30px; }
            .box { 
                border: 1px solid #000; 
                margin-bottom: 20px; 
                padding: 0;
            }
            .box-header {
                background-color: #f0f0f0;
                padding: 8px;
                border-bottom: 1px solid #000;
                font-weight: bold;
            }
            .box-content {
                padding: 10px;
            }
            .passenger-row {
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="title">عقد نقل على الطرق البرية</div>
        
        <div class="agreement">
            تم ابرام هذا العقد بين المتعاقدين بناء على المادة (39) التاسعة و الثلاثون من اللائحة المنظمة لنشاط النقل المتخصص و تأجير و توجيه الحافلات<br>
            و بناء على الفقرة (1) من المادة (39) و التي تنص على ان يجب على الناقل ابرام عقد نقل مع الاطراف المحددين في المادة (40) قبل تنفيذ عمليات النقل على الطرق البرية<br><br>
            الطرف الاول : شركة صاعقة الطريق للنقل البري (شخص واحد)<br>
            الطرف الثاني : ' . $data['main_passenger'] . '
        </div>

        <div class="box">
            <div class="box-header">معلومات الرحلة / Trip Information</div>
            <div class="box-content">
                التاريخ / Date: ' . $data['date'] . '<br>
                من / From: ' . $data['from_city'] . '<br>
                إلى / To: ' . $data['to_city'] . '<br>
                نوع التأشيرة / Visa Type: ' . $data['visa_type'] . '<br>
                رقم الرحلة / Trip No.: ' . $data['trip_number'] . '
            </div>
        </div>

        <div class="box">
            <div class="box-header">معلومات السائق / Driver Information</div>
            <div class="box-content">
                اسم السائق / Driver Name: ' . $data['driver_name'] . '<br>
                رقم الهوية / ID Number: ' . $data['driver_id'] . '<br>
                رقم الرخصة / License Number: ' . $data['license_number'] . '
            </div>
        </div>

        <div class="box">
            <div class="box-header">معلومات الركاب / Passenger Information</div>
            <div class="box-content">';

    foreach ($data['passengers'] as $index => $passenger) {
        $html .= '
            <div class="passenger-row">
                ' . ($index + 1) . '. ' . $passenger['name'] . '<br>
                رقم الهوية / ID: ' . $passenger['id_number'] . '<br>
                الجنسية / Nationality: ' . $passenger['nationality'] . '
            </div>';
    }

    $html .= '
            </div>
        </div>
    </body>
    </html>';

    // Write the HTML to PDF
    $mpdf->WriteHTML($html);

    // Return the PDF as a string
    return $mpdf->Output('', 'S');
}
?>
