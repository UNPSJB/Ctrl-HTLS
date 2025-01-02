const Pais = require('../../models/core/Pais');
const Provincia = require('../../models/core/Provincia');
const Ciudad = require('../../models/core/Ciudad');

const createPais = async (nombre) => {
  const existingPais = await Pais.findOne({ where: { nombre } });
  if (existingPais) {
    throw new Error('El país ya existe');
  }
  return await Pais.create({ nombre });
};

const createProvincia = async (nombre, paisId) => {
  const existingProvincia = await Provincia.findOne({
    where: { nombre, paisId },
  });
  if (existingProvincia) {
    throw new Error('La provincia ya existe en este país');
  }
  return await Provincia.create({ nombre, paisId });
};

const createCiudad = async (nombre, provinciaId, codigoPostal) => {
  const existingCiudad = await Ciudad.findOne({
    where: { nombre, provinciaId },
  });
  if (existingCiudad) {
    throw new Error('La ciudad ya existe en esta provincia');
  }
  const existingCodigoPostal = await Ciudad.findOne({
    where: { codigoPostal },
  });
  if (existingCodigoPostal) {
    throw new Error('El código postal ya existe');
  }
  return await Ciudad.create({ nombre, provinciaId, codigoPostal });
};

module.exports = {
  createPais,
  createProvincia,
  createCiudad,
};
