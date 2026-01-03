const PDFDocument = require('pdfkit');

const generarPDFFactura = (factura, pago, detalles, cliente) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Encabezado
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('FACTURA', { align: 'center' });

      doc.moveDown(0.5);

      // Tipo de factura
      doc
        .fontSize(14)
        .text(`Tipo: ${factura.tipo_factura}`, { align: 'center' });

      doc.moveDown(1);

      // Información de la factura
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Número: ${String(factura.numero).padStart(8, '0')}`, 50)
        .text(
          `Fecha: ${new Date(factura.fecha).toLocaleDateString('es-AR')}`,
          50,
        );

      doc.moveDown(1);

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // Datos del cliente
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DATOS DEL CLIENTE');

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Nombre: ${cliente.nombre} ${cliente.apellido}`)
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
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // Encabezado de detalles
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DETALLE DE FACTURA');

      doc.moveDown(0.5);

      // Tabla de detalles - encabezados
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 300;
      const col3 = 400;
      const col4 = 480;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Descripción', col1, tableTop)
        .text('P. Unit.', col2, tableTop)
        .text('Subtotal', col3, tableTop);

      doc.moveDown(0.5);

      // Línea debajo de encabezados
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(0.3);

      // Filas de detalles
      doc.font('Helvetica');
      let yPosition = doc.y;

      detalles.forEach((detalle) => {
        const precioUnitario = Number(detalle.precio_unitario).toFixed(2);
        const subtotal = Number(detalle.subtotal).toFixed(2);

        doc
          .text(detalle.descripcion, col1, yPosition, { width: 240 })
          .text(`$${precioUnitario}`, col2, yPosition)
          .text(`$${subtotal}`, col3, yPosition);

        yPosition = doc.y + 5;
        doc.y = yPosition;
      });

      doc.moveDown(1);

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // Total
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(
          `TOTAL: $${Number(factura.importe_total).toFixed(2)}`,
          { align: 'right' },
        );

      doc.moveDown(1);

      // Información del pago
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('INFORMACIÓN DE PAGO');

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Medio de pago: ${pago.tipo_pago}`);

      if (pago.importe_efectivo) {
        doc.text(`Efectivo: $${Number(pago.importe_efectivo).toFixed(2)}`);
      }

      if (pago.importe_tarjeta) {
        doc.text(`Tarjeta: $${Number(pago.importe_tarjeta).toFixed(2)}`);
      }

      doc.text(`Importe total: $${Number(pago.importe).toFixed(2)}`);

      doc.moveDown(2);

      // Pie de página
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Gracias por su compra',
          50,
          doc.page.height - 50,
          { align: 'center' },
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarPDFFactura,
};
