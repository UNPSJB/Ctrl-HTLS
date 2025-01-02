const express = require('express');
//const { createLocalidad } = require('../controllers/core/localidadController');
const {
  validateLocalidad,
} = require('../../validators/core/localidadValidators');
const {
  createLocalidad,
} = require('../../controllers/core/localidadController');

const router = express.Router();

router.post('/localidad', validateLocalidad, createLocalidad);

module.exports = router;
