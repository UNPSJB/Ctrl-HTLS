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

const validateTarifasPayload = [
  body('tarifas')
    .exists()
    .withMessage('El campo "tarifas" es requerido')
    .isArray({ min: 1 })
    .withMessage(
      'El campo "tarifas" debe ser un arreglo con al menos un elemento',
    ),
  body('tarifas.*.tipoHabitacionId')
    .isInt({ min: 1 })
    .withMessage('Cada tarifa debe incluir un "tipoHabitacionId" válido'),
  body('tarifas.*.precio')
    .isFloat({ min: 0 })
    .withMessage('Cada tarifa debe incluir un "precio" mayor o igual a 0'),
];

const validateTemporadaId = [
  param('idTemporada')
    .isInt()
    .withMessage('El idTemporada debe ser un número entero'),
];

module.exports = {
  validateHotel,
  validateId,
  validateTarifasPayload,
  validateTemporadaId,
};
