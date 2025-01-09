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
} = require('../../controllers/core/localidadController');

const router = express.Router();

router.post('/localidad', validateLocalidad, createLocalidad); //Ruta para crear paises, provincias y ciudades
router.put('/localidad/:id', validateId, validateLocalidad, updateLocalidad); //Ruta para actualizar paises, provincias y ciudades
router.delete('/localidad/:id', validateId, deleteLocalidad); //Ruta para eliminar paises, provincias y ciudades

router.get('/paises', getPaises); //Ruta para obtener todos los paises
router.get('/provincias/:paisId', getProvincias); //Ruta para obtener todas las provincias de un pais
//router.get('/ciudades/:provinciaId', getCiudades); //Ruta para obtener todas las ciudades de una provincia
module.exports = router;
