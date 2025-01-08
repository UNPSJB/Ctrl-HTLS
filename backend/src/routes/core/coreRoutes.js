const express = require('express');
const {
  validateLocalidad,
} = require('../../validators/core/localidadValidators');
const {
  createLocalidad,
  getPaises,
  updateLocalidad,
  deleteLocalidad,
} = require('../../controllers/core/localidadController');

const router = express.Router();

router.post('/localidad', validateLocalidad, createLocalidad); //Ruta para crear paises, provincias y ciudades
router.put('/localidad/:id', validateLocalidad, updateLocalidad); //Ruta para actualizar paises, provincias y ciudades
router.delete('/localidad/:id', deleteLocalidad); //Ruta para eliminar paises, provincias y ciudades

router.get('/paises', getPaises); //Ruta para obtener todos los paises
//router.get('/provincias/:paisId', getProvincias); //Ruta para obtener todas las provincias de un pais

module.exports = router;
