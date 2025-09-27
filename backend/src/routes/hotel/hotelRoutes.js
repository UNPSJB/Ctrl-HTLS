const express = require('express');

const {
  validateHotel,
  validateId,
} = require('../../validators/hotel/hotelValidators');

const {
  createHotel,
  updateHotel,
  setTemporada,
  getCategorias,
  setDescuento,
  setHabitaciones,
  updateHabitacion,
  deleteHabitacion,
  setPaquetePromocional,
  getTiposDeHabitacion,
  createEncargado,
  asignarEmpleado,
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

router.post('/hotel/encargados', createEncargado);

//Rutas de tipos de habitaciones
router.get('/obtener-tiposHabitaciones', getTiposDeHabitacion); //Ruta para obtener las categorias de los hoteles

router.post(
  '/hotel/:id/paquete-promocional',
  validateId,
  setPaquetePromocional,
); //Ruta para crear un paquete promocional en un hotel

//IMPLEMENTAR
// router.put('/hotel/:id/paquete-promocional/:idPaquete', validateId, updatePaquetePromocional); //Ruta para modificar un paquete promocional en un hotel
// router.delete('/hotel/:id/paquete-promocional/:idPaquete', validateId, deletePaquetePromocional); //Ruta para eliminar un paquete promocional en un hotel

router.post('/hotel/:id/temporada', validateId, setTemporada); //Ruta para crear una temporada en un hotel
//IMPLEMENTAR
// router.put('/hotel/:id/temporada/:idTemporada', validateId, updateTemporada); //Ruta para modificar una temporada en un hotel
// router.delete('/hotel/:id/temporada/:idTemporada', validateId, deleteTemporada); //Ruta para eliminar una temporada en un hotel

router.post('/hotel/:id/descuentos', validateId, setDescuento); //Ruta para crear una habitacion en un hotel

router.post('/hotel/asignar-empleado', asignarEmpleado); //Ruta para asingar un empleado a un hotel

//IMPLEMENTAR
//router.post('/hotel/desasignar-empleado', asignarEmpleado);

module.exports = router;
