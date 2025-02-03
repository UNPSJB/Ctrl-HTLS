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
  updateHabitacion,
  deleteHabitacion,
  setPaquetePromocional,
} = require('../../controllers/hotel/hotelController');

const router = express.Router();

router.post('/hotel', validateHotel, createHotel); //Ruta para crear un hotel
router.put('/hotel/:id', validateId, validateHotel, updateHotel); //Ruta para modificar un hotel
router.get('/categorias', getCategorias); //Ruta para obtener las categorias de los hoteles
router.post('/hotel/:id/habitacion', validateId, setHabitaciones); //Ruta para crear una habitacion en un hotel
router.put('/hotel/:id/habitacion/:idHabitacion', validateId, updateHabitacion); //Ruta para crear una habitacion en un hotel
router.delete(
  '/hotel/:id/habitacion/:idHabitacion',
  validateId,
  deleteHabitacion,
);

router.post(
  '/hotel/:id/paquete-promocional',
  validateId,
  setPaquetePromocional,
); //Ruta para crear un paquete promocional en un hotel

module.exports = router;
