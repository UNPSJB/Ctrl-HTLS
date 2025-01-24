const express = require('express');

const {
  validateHotel,
  validateId,
} = require('../../validators/hotel/hotelValidators');

const {
  createHotel,
  updateHotel,
  getCategorias,
} = require('../../controllers/hotel/hotelController');

const router = express.Router();

router.post('/hotel', validateHotel, createHotel); //Ruta para crear un hotel
router.put('/hotel/:id', validateId, validateHotel, updateHotel); //Ruta para modificar un hotel
router.get('/categorias', getCategorias); //Ruta para obtener las categorias de los hoteles

module.exports = router;
