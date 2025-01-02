const express = require('express');
const {
  validateLocalidad,
} = require('../../validators/core/localidadValidators');
const {
  createLocalidad,
  getPaises,
} = require('../../controllers/core/localidadController');

const router = express.Router();

router.post('/localidad', validateLocalidad, createLocalidad);
router.get('/paises', getPaises);

module.exports = router;
