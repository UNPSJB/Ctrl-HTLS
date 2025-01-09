const { body, param } = require('express-validator');

const validatePersona = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser una cadena de caracteres')
    .toLowerCase(),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isString()
    .withMessage('El apellido debe ser una cadena de caracteres')
    .toLowerCase(),
  body('tipoDocumento')
    .notEmpty()
    .withMessage('El tipo de documento es requerido')
    .isIn(['dni', 'li', 'le', 'pasaporte'])
    .withMessage(
      'El tipo de documento debe ser uno de los siguientes: DNI, LI, LE, Pasaporte',
    )
    .toLowerCase(),
  body('telefono')
    .optional()
    .isString()
    .withMessage('El teléfono debe ser una cadena de caracteres')
    .toLowerCase(),
  body('numeroDocumento')
    .notEmpty()
    .withMessage('El número de documento es requerido')
    .isString()
    .withMessage('El número de documento debe ser una cadena de caracteres')
    .isLength({ min: 7, max: 15 })
    .withMessage('El número de documento debe tener entre 7 y 15 caracteres')
    .toLowerCase(),
  body('direccion')
    .optional()
    .isString()
    .withMessage('La dirección debe ser una cadena de caracteres')
    .toLowerCase(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .toLowerCase(),
  body('puntos')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Los puntos deben ser un número entero positivo'),
];

const validateId = [
  param('id').isInt().withMessage('El id debe ser un número entero'),
];

module.exports = { validatePersona, validateId };
