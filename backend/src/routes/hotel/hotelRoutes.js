const express = require('express');

const {
  validateHotel,
  validateId,
  validateTarifasPayload,
} = require('../../validators/hotel/hotelValidators');

const {
  createHotel,
  updateHotel,
  getAllHoteles,
  getHotelById,
  setTemporada,
  getCategorias,
  getHabitaciones,
  getPaquetes,
  getTarifas,
  getEncargados,
  setDescuento,
  setHabitaciones,
  updateHabitacion,
  deleteHabitacion,
  setPaquetePromocional,
  getTiposDeHabitacion,
  createEncargado,
  deleteEncargado,
  asignarEmpleado,
  desasignarEmpleado,
  updateTarifas,
} = require('../../controllers/hotel/hotelController');

const router = express.Router();

router.get('/hoteles', getAllHoteles); //Ruta para obtener todos los hoteles
router.get('/hotel/encargados', getEncargados); //Ruta para obtener todos los encargados
router.get('/hotel/:id', validateId, getHotelById); //Ruta para obtener un hotel por id
router.get('/hotel/:id/habitaciones', validateId, getHabitaciones); //Ruta para listar habitaciones físicas del hotel
router.get('/hotel/:id/paquetes', validateId, getPaquetes); //Ruta para listar paquetes promocionales del hotel
router.get('/hotel/:id/tarifas', validateId, getTarifas); //Ruta para obtener tarifas por tipo de habitación
router.post('/hotel', validateHotel, createHotel); //Ruta para crear un hotel
router.put('/hotel/:id', validateId, validateHotel, updateHotel); //Ruta para modificar un hotel
router.put(
  '/hotel/:id/tarifas',
  validateId,
  validateTarifasPayload,
  updateTarifas,
); //Ruta para actualizar tarifas del hotel
router.get('/categorias', getCategorias); //Ruta para obtener las categorias de los hoteles
router.post('/hotel/:id/habitacion', validateId, setHabitaciones); //Ruta para crear una habitacion en un hotel
router.put('/hotel/:id/habitacion/:idHabitacion', validateId, updateHabitacion); //Ruta para crear una habitacion en un hotel
router.delete(
  '/hotel/:id/habitacion/:idHabitacion',
  validateId,
  deleteHabitacion,
);

router.post('/hotel/encargados', createEncargado);
router.delete('/hotel/encargados/:id', validateId, deleteEncargado);

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

router.post('/hotel/desasignar-empleado', desasignarEmpleado); //Ruta para desasignar un empleado de un hotel

module.exports = router;
