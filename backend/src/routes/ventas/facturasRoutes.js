const express = require('express');
const {
  confirmarPago,
  getVentasResumen,
  getFacturaPDF,
  buscarVentas,
  getDetalleFactura,
  getVentasVendedor,
  getVentasAnuales,
  getRegistroMensual,
} = require('../../controllers/ventas/facturasController');
const router = express.Router();

router.post('/generarFactura');

router.post('/confirmar-pago', confirmarPago);

router.get('/ventas', getVentasResumen); // Resumen de ventas del día, semana y mes

router.get('/factura/:id/ver-factura', getFacturaPDF); // Previsualizar PDF de una factura

router.get('/buscar-ventas', buscarVentas); // Buscar ventas por filtros

router.get('/factura/:id/detalle', getDetalleFactura); // Detalle completo de una factura

router.get('/ventas-anuales', getVentasAnuales); // Ventas del año agrupadas por mes

router.get('/top-ventas', getRegistroMensual); // Top vendedores y hoteles del mes

router.get('/ventas/:vendedorId', getVentasVendedor); // Ventas de un vendedor por rango de fechas

module.exports = router;
