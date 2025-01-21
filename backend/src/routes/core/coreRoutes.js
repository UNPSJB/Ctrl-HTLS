const express = require('express');
const {
  validateLocalidad,
  validateId,
} = require('../../validators/core/localidadValidators');
const {
  validateEmpleado,
  validateCliente,
} = require('../../validators/core/personaValidators');

const {
  createLocalidad,
  getPaises,
  updateLocalidad,
  deleteLocalidad,
  getProvincias,
  getCiudades,
  getPaisById,
  getProvinciaById,
  getCiudadById,
} = require('../../controllers/core/localidadController');

const {
  createEmpleado,
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
} = require('../../controllers/core/personaController');

const router = express.Router();

//#region Rutas de Localidades

router.post('/localidad', validateLocalidad, createLocalidad); //Ruta para crear paises, provincias y ciudades
router.put('/localidad/:id', validateId, validateLocalidad, updateLocalidad); //Ruta para actualizar paises, provincias y ciudades
router.delete('/localidad/:id', validateId, deleteLocalidad); //Ruta para eliminar paises, provincias y ciudades
router.get('/paises', getPaises); //Ruta para obtener todos los paises
router.get('/paises/:id', validateId, getPaisById); //Ruta para obtener un país por su ID
router.get('/provincias/:paisId', getProvincias); //Ruta para obtener todas las provincias de un pais
router.get('/provincias/:id', validateId, getProvinciaById); //Ruta para obtener una provincia por su ID
router.get('/ciudades/:provinciaId', getCiudades); //Ruta para obtener todas las ciudades de una provincia
router.get('/ciudades/:id', validateId, getCiudadById); //Ruta para obtener una ciudad por su ID

//#endregion

router.post('/empleado', validateEmpleado, createEmpleado); //Ruta para crear un administrador
router.post('/cliente', validateCliente, createCliente); //Ruta para crear un cliente
router.get('/clientes', getClientes); //Ruta para obtener todos los clientes
router.get('/cliente/:id', validateId, getClienteById); //Ruta para obtener un cliente por su ID
router.put('/cliente/:id', validateId, validateCliente, updateCliente); //Ruta para actualizar un cliente

module.exports = router;
