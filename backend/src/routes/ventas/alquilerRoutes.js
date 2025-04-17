const express = require('express');
const {
  getDisponibilidad,
  setReserva,
  deleteReserva,
} = require('../../controllers/ventas/alquilerController');
const {
  validarDisponibilidad,
} = require('../../validators/ventas/disponibilidadValidators');
const router = express.Router();

router.get('/disponibilidad', validarDisponibilidad, getDisponibilidad); //Ruta para obtener la disponibilidad de varios hotel
router.post('/reservar', setReserva);
router.post('/cancelar-reserva', deleteReserva); //Ruta para cancelar una reserva
module.exports = router;
