const express = require('express');
const {
  validateLocalidad,
  validateId,
} = require('../../validators/core/localidadValidators');
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

const router = express.Router();

//#region Routas de Localidades

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

router.post('/administrador');

module.exports = router;
