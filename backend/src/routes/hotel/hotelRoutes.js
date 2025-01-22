const express = require('express');

const {
  validateHotel,
  validateId,
} = require('../../validators/hotel/hotelValidators');

const { createHotel } = require('../../controllers/hotel/hotelController');

const router = express.Router();

router.post('/hotel', validateHotel, createHotel); //Ruta para crear un hotel

module.exports = router;
