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
  updateEmpleado,
  deleteEmpleado,
  createCliente,
  getVendedores,
  getVendedor,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
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

//#region Rutas de Empleados
router.post('/empleado', validateEmpleado, createEmpleado); //Ruta para crear un administrador
router.put('/empleado/:id', validateId, validateEmpleado, updateEmpleado); //Ruta para actualizar un administrador
router.delete('/empleado/:id', validateId, deleteEmpleado); //Ruta para eliminar un administrador
router.get('/vendedores', getVendedores); //Ruta para obtener todos los vendedores
router.get('vendedor/:id', validateId, getVendedor); //Ruta para obtener un vendedor por su ID
//#endregion

//#region Rutas de Clientes
router.post('/cliente', validateCliente, createCliente); //Ruta para crear un cliente
router.get('/clientes', getClientes); //Ruta para obtener todos los clientes
router.get('/cliente/:id', validateId, getClienteById); //Ruta para obtener un cliente por su ID
router.put('/cliente/:id', validateId, validateCliente, updateCliente); //Ruta para actualizar un cliente
router.delete('/cliente/:id', validateId, deleteCliente); //Ruta para eliminar un cliente
//#endregion

module.exports = router;
