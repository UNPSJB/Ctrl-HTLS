const express = require('express');
const {
  getHistorialVentas,
  getVentasPorFecha,
} = require('../../controllers/ventas/historialVentasController');

const router = express.Router();

router.get('/hotel/:hotelId/historial-ventas', getHistorialVentas);
router.get('/ventas-por-fecha', getVentasPorFecha);

module.exports = router;
