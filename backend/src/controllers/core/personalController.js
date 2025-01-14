const { validationResult } = require('express-validator');
const crearEmpleado = require('../../services/core/personalServices');

const createEmpleado = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const empleado = await crearEmpleado(req.body);
    return res.status(201).json(empleado);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { createEmpleado };
