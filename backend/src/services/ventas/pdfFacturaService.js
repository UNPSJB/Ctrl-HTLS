const PDFDocument = require('pdfkit');
const path = require('path');
const sharp = require('sharp');

const formatMoney = (valor) => {
  return Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generarPDFFactura = async (factura, pago, detalles, cliente) => {
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

      const copias = ['ORIGINAL', 'DUPLICADO', 'TRIPLICADO'];

      copias.forEach((copia, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Leyenda de copia y tipo de factura arriba de todo
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(copia, { align: 'center' });

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(`FACTURA ${factura.tipo_factura}`, { align: 'center' });

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

        // Información de la factura
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Comprobante N°: ${String(factura.numero).padStart(8, '0')}`,
            50,
          )
          .text(
            `Fecha de emisión: ${new Date(factura.fecha).toLocaleDateString('es-AR')}`,
            50,
          );

        doc.moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.5);

        // Datos del cliente
        doc.fontSize(11).font('Helvetica-Bold').text('DATOS DEL CLIENTE');

        doc.moveDown(0.3);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Cliente: ${cliente.nombre} ${cliente.apellido}`)
          .text(
            `Documento: ${cliente.tipoDocumento.toUpperCase()} ${cliente.numeroDocumento}`,
          );

        if (cliente.telefono) {
          doc.text(`Teléfono: ${cliente.telefono}`);
        }

        if (cliente.email) {
          doc.text(`Email: ${cliente.email}`);
        }

        doc.moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.5);

        // Encabezado de detalles
        doc.fontSize(11).font('Helvetica-Bold').text('DETALLE');

        doc.moveDown(0.5);

        // Tabla de detalles - encabezados
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 320;
        const col3 = 430;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Descripción', col1, tableTop)
          .text('P. Unit.', col2, tableTop)
          .text('Subtotal', col3, tableTop);

        doc.moveDown(0.5);

        // Línea debajo de encabezados
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        doc.moveDown(0.3);

        // Filas de detalles
        doc.font('Helvetica');
        let yPosition = doc.y;

        detalles.forEach((detalle) => {
          const precioUnitario = formatMoney(detalle.precio_unitario);
          const subtotal = formatMoney(detalle.subtotal);

          const rowHeight = doc.heightOfString(detalle.descripcion, {
            width: 260,
          });

          doc.text(detalle.descripcion, col1, yPosition, { width: 260 });
          doc.text(`$${precioUnitario}`, col2, yPosition);
          doc.text(`$${subtotal}`, col3, yPosition);

          yPosition += rowHeight + 10;
          doc.y = yPosition;
        });

        // Información del pago y Total posicionados en la parte inferior
        const bottomMargin = doc.page.margins.bottom;
        const pagoY = doc.page.height - bottomMargin - 80;

        // Línea separadora arriba del pago
        doc
          .moveTo(50, pagoY - 10)
          .lineTo(550, pagoY - 10)
          .stroke();

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Medio de pago:', 50, pagoY);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${pago.tipo_pago}`, 140, pagoY);

        let pagoLineY = pagoY + 15;

        if (pago.importe_efectivo) {
          doc.text(
            `Efectivo: $${formatMoney(pago.importe_efectivo)}`,
            50,
            pagoLineY,
          );
          pagoLineY += 15;
        }

        if (pago.importe_tarjeta) {
          doc.text(
            `Tarjeta: $${formatMoney(pago.importe_tarjeta)}`,
            50,
            pagoLineY,
          );
          pagoLineY += 15;
        }

        // Total alineado a la derecha
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(`TOTAL: $${formatMoney(factura.importe_total)}`, 350, pagoY, {
            width: 200,
            align: 'right',
          });

        // Pie de página
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            'Gracias por su compra - Ctrl-Hoteles',
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
  generarPDFFactura,
};
