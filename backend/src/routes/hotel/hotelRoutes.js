const express = require('express');

const {
  validateHotel,
  validateId,
} = require('../../validators/hotel/hotelValidators');

const {
  createHotel,
  updateHotel,
  getCategorias,
  setHabitaciones,
} = require('../../controllers/hotel/hotelController');

const router = express.Router();

router.post('/hotel', validateHotel, createHotel); //Ruta para crear un hotel
router.put('/hotel/:id', validateId, validateHotel, updateHotel); //Ruta para modificar un hotel
router.get('/categorias', getCategorias); //Ruta para obtener las categorias de los hoteles
router.post('/hotel/:id/habitacion', validateId, setHabitaciones); //Ruta para crear una habitacion en un hotel

module.exports = router;
