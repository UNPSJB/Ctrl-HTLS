const express = require('express');
const {
  confirmarPago,
  getVentasResumen,
  getFacturaPDF,
} = require('../../controllers/ventas/facturasController');
const router = express.Router();

router.post('/generarFactura');

router.post('/confirmar-pago', confirmarPago);

router.get('/ventas', getVentasResumen); // Resumen de ventas del día, semana y mes

router.get('/factura/:id/pdf', getFacturaPDF); // Previsualizar PDF de una factura

module.exports = router;
