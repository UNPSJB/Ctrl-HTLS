const { body, param } = require('express-validator');

const validateHotel = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser una cadena de caracteres')
    .toLowerCase(),
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isString()
    .withMessage('La dirección debe ser una cadena de caracteres')
    .toLowerCase(),
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isString()
    .withMessage('El teléfono debe ser una cadena de caracteres')
    .toLowerCase(),
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .toLowerCase(),
  body('ciudadId')
    .notEmpty()
    .withMessage('El ID de la ciudad es requerido')
    .isInt()
    .withMessage('El ID de la ciudad debe ser un número entero'),
  body('encargadoId')
    .notEmpty()
    .withMessage('El ID del encargado es requerido')
    .isInt()
    .withMessage('El ID del encargado debe ser un número entero'),
  body('categoriaId')
    .notEmpty()
    .withMessage('El ID de la categoría es requerido')
    .isInt()
    .withMessage('El ID de la categoría debe ser un número entero'),
];

const validateId = [
  param('id').isInt().withMessage('El id debe ser un número entero'),
];

module.exports = { validateHotel, validateId };
