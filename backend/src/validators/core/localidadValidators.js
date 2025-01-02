const { body } = require('express-validator');

const validateLocalidad = [
  body('tipo')
    .isIn(['pais', 'provincia', 'ciudad'])
    .withMessage('Tipo de localidad no válido'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('paisId')
    .if(body('tipo').equals('provincia'))
    .notEmpty()
    .withMessage('paisId es requerido para crear una provincia'),
  body('provinciaId')
    .if(body('tipo').equals('ciudad'))
    .notEmpty()
    .withMessage('provinciaId es requerido para crear una ciudad'),
  body('codigoPostal')
    .if(body('tipo').equals('ciudad'))
    .notEmpty()
    .withMessage('El código postal es requerido para crear una ciudad'),
];

module.exports = { validateLocalidad };
