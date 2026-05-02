const express = require('express');
const {
  getHistorialVentas,
} = require('../../controllers/ventas/historialVentasController');

const router = express.Router();

router.get('/hotel/:hotelId/historial-ventas', getHistorialVentas);

module.exports = router;
