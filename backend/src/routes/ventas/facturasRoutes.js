const express = require('express');
const {
  confirmarPago,
  getVentasResumen,
  getFacturaPDF,
  buscarVentas,
} = require('../../controllers/ventas/facturasController');
const router = express.Router();

router.post('/generarFactura');

router.post('/confirmar-pago', confirmarPago);

router.get('/ventas', getVentasResumen); // Resumen de ventas del día, semana y mes

router.get('/factura/:id/pdf', getFacturaPDF); // Previsualizar PDF de una factura

router.get('/buscar-ventas', buscarVentas); // Buscar ventas por filtros

module.exports = router;
