const { body, param } = require('express-validator');

// Validaciones comunes para todas las personas
const commonValidations = [
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
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .toLowerCase(),
  body('telefono')
    .optional()
    .isString()
    .withMessage('El teléfono debe ser una cadena de caracteres')
    .toLowerCase(),
  body('tipoDocumento')
    .notEmpty()
    .withMessage('El tipo de documento es requerido')
    .isIn(['dni', 'li', 'le', 'pasaporte'])
    .withMessage(
      'El tipo de documento debe ser uno de los siguientes: DNI, LI, LE, Pasaporte',
    )
    .toLowerCase(),
  body('numeroDocumento')
    .notEmpty()
    .withMessage('El número de documento es requerido')
    .isString()
    .withMessage('El número de documento debe ser una cadena de caracteres')
    .isLength({ min: 7, max: 15 })
    .withMessage('El número de documento debe tener entre 7 y 15 caracteres')
    .toLowerCase(),
];

// Validaciones específicas para Empleado
const validateEmpleado = [
  ...commonValidations,
  body('rol')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isIn(['administrador', 'vendedor', 'desarrollador'])
    .withMessage(
      'El rol debe ser uno de los siguientes: Administrador, Vendedor, Desarrollador',
    )
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isString()
    .withMessage('La contraseña debe ser una cadena de caracteres'),
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isString()
    .withMessage('La dirección debe ser una cadena de caracteres')
    .toLowerCase(),
];

// Validaciones específicas para Cliente
const validateCliente = [...commonValidations];

const validateId = [
  param('id').isInt().withMessage('El id debe ser un número entero'),
];

module.exports = { validateEmpleado, validateCliente, validateId };
