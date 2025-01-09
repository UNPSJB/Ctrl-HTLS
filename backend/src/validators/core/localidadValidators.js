const { body, param } = require('express-validator');

const validateLocalidad = [
  body('tipo')
    .isIn(['pais', 'provincia', 'ciudad'])
    .withMessage('Tipo de localidad no válido')
    .toLowerCase(),
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .toLowerCase()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage(
      'El nombre no debe contener símbolos ni caracteres especiales',
    ),
  body('paisId')
    .if(body('tipo').equals('provincia'))
    .notEmpty()
    .withMessage('paisId es requerido para crear una provincia')
    .toLowerCase()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('paisId no debe contener símbolos ni caracteres especiales'),
  body('provinciaId')
    .if(body('tipo').equals('ciudad'))
    .notEmpty()
    .withMessage('provinciaId es requerido para crear una ciudad')
    .toLowerCase()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage(
      'provinciaId no debe contener símbolos ni caracteres especiales',
    ),
  body('codigoPostal')
    .if(body('tipo').equals('ciudad'))
    .notEmpty()
    .withMessage('El código postal es requerido para crear una ciudad')
    .toLowerCase()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage(
      'El código postal no debe contener símbolos ni caracteres especiales',
    ),
];

const validateId = [
  param('id').isInt().withMessage('El id debe ser un número entero'),
];

module.exports = { validateLocalidad, validateId };
