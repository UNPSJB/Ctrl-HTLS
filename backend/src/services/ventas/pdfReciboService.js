const PDFDocument = require('pdfkit');
const path = require('path');
const sharp = require('sharp');

const formatMoney = (valor) => {
  return Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generarPDFRecibo = async (liquidacion, vendedor, detalles) => {
  let logoBuffer = null;
  const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.svg');
  try {
    logoBuffer = await sharp(logoPath)
      .resize({ width: 150, height: 40, fit: 'inside' })
      .png()
      .toBuffer();
  } catch (e) {
    // Si no se puede cargar el logo, continuar sin él
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const copias = ['ORIGINAL', 'DUPLICADO'];

      copias.forEach((copia, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Leyenda de copia arriba de todo
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(copia, { align: 'center' });

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('RECIBO DE COMISIÓN', { align: 'center' });

        doc.moveDown(0.5);

        // Logo arriba a la derecha
        if (logoBuffer) {
          doc.image(logoBuffer, 430, doc.y - 5, { width: 120 });
        }

        // Razón social y datos de la empresa (izquierda)
        doc.fontSize(14).font('Helvetica-Bold').text('Ctrl-Hoteles', 50);

        doc
          .fontSize(9)
          .font('Helvetica')
          .text('CUIT: 30-12345678-9', 50)
          .text('San Martín 987 - Trelew, Chubut', 50)
          .text('Tel: 2804-123456', 50);

        doc.moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.5);

        // Información del recibo
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Recibo N°: ${String(liquidacion.numero).padStart(8, '0')}`,
            50,
          )
          .text(
            `Fecha de emisión: ${new Date(liquidacion.fecha_emision).toLocaleDateString('es-AR')}`,
            50,
          )
          .text(
            `Vendedor: ${vendedor.nombre} ${vendedor.apellido}`,
            50,
          );

        doc.moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.5);

        // Encabezado de detalles
        doc.fontSize(11).font('Helvetica-Bold').text('DETALLE DE VENTAS');

        doc.moveDown(0.5);

        // Tabla de detalles - encabezados
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 350;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Descripción', col1, tableTop)
          .text('Monto', col2, tableTop);

        doc.moveDown(0.5);

        // Línea debajo de encabezados
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.3);

        // Filas de detalles
        doc.font('Helvetica');
        let yPosition = doc.y;

        detalles.forEach((detalle) => {
          const rowHeight = doc.heightOfString(detalle.descripcion, {
            width: 280,
          });

          doc.text(detalle.descripcion, col1, yPosition, { width: 280 });
          doc.text(`$${formatMoney(detalle.subtotal)}`, col2, yPosition);

          yPosition += rowHeight + 8;
          doc.y = yPosition;
        });

        doc.moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.5);

        // Comisión y forma de pago
        const comisionY = doc.y;

        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Forma de pago: Efectivo', 50, comisionY);

        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(
            `COMISIÓN: $${formatMoney(liquidacion.total)}`,
            350,
            comisionY,
            { width: 200, align: 'right' },
          );

        // Firma del vendedor posicionada en la parte inferior
        const bottomMargin = doc.page.margins.bottom;
        const firmaY = doc.page.height - bottomMargin - 80;

        // Línea para firma
        doc.moveTo(50, firmaY).lineTo(250, firmaY).stroke();

        doc
          .fontSize(9)
          .font('Helvetica')
          .text('Firma del vendedor', 50, firmaY + 5);

        doc
          .text(
            `${vendedor.nombre} ${vendedor.apellido}`,
            50,
            firmaY + 18,
          );

        // Pie de página
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            'Ctrl-Hoteles - Recibo de comisión',
            50,
            doc.page.height - bottomMargin - 15,
            {
              align: 'center',
            },
          );
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarPDFRecibo,
};
