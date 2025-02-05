const { query } = require('express-validator');

const validarDisponibilidad = [
  query('ubicacion')
    .isInt({ min: 1 })
    .withMessage('La ubicación debe ser un número entero positivo'),
  query('fechaInicio')
    .isISO8601()
    .withMessage(
      'La fecha de inicio debe ser una fecha válida en formato ISO8601',
    ),
  query('fechaFin')
    .isISO8601()
    .withMessage(
      'La fecha de fin debe ser una fecha válida en formato ISO8601',
    ),
  query('pasajeros')
    .isInt({ min: 1 })
    .withMessage('El número de pasajeros debe ser un número entero positivo'),
];

module.exports = { validarDisponibilidad };
