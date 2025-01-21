const Ciudad = require('../models/core/Ciudad');
const CustomError = require('./CustomError');

const verificarCiudad = async (ciudadId) => {
  const ciudadExistente = await Ciudad.findByPk(ciudadId);
  if (!ciudadExistente) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }
};

module.exports = { verificarCiudad };
