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

const updatePais = async (id, nombre) => {
  const pais = await Pais.findByPk(id);
  if (!pais) {
    throw new Error('El país no existe');
  }
  pais.nombre = nombre;
  await pais.save();
  return pais;
};

const updateProvincia = async (id, nombre, paisId) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new Error('La provincia no existe');
  }
  provincia.nombre = nombre;
  provincia.paisId = paisId;
  await provincia.save();
  return provincia;
};

const updateCiudad = async (id, nombre, provinciaId, codigoPostal) => {
  const ciudad = await Ciudad.findByPk(id);
  if (!ciudad) {
    throw new Error('La ciudad no existe');
  }
  ciudad.nombre = nombre;
  ciudad.provinciaId = provinciaId;
  ciudad.codigoPostal = codigoPostal;
  await ciudad.save();
  return ciudad;
};

const deletePais = async (id) => {
  const pais = await Pais.findByPk(id);
  if (!pais) {
    throw new Error('El país no existe');
  }
  await pais.destroy();
  return pais;
};

const deleteProvincia = async (id) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new Error('La provincia no existe');
  }
  await provincia.destroy();
  return provincia;
};

const deleteCiudad = async (id) => {
  const ciudad = await Ciudad.findByPk(id);
  if (!ciudad) {
    throw new Error('La ciudad no existe');
  }
  await ciudad.destroy();
  return ciudad;
};

const obtenerPaises = async () => {
  return await Pais.findAll();
};

const obtenerProvincias = async (paisId) => {
  const pais = await Pais.findByPk(paisId);
  if (!pais) {
    throw new Error('El país no existe');
  }
  return await Provincia.findAll({ where: { paisId } });
};

module.exports = {
  createPais,
  createProvincia,
  createCiudad,
  updatePais,
  updateProvincia,
  updateCiudad,
  deletePais,
  deleteProvincia,
  deleteCiudad,
  obtenerPaises,
  obtenerProvincias,
};
