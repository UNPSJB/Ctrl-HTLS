const Pais = require('../../models/core/Pais');
const Provincia = require('../../models/core/Provincia');
const Ciudad = require('../../models/core/Ciudad');
const CustomError = require('../../utils/CustomError');

const createPais = async (nombre) => {
  const existingPais = await Pais.findOne({ where: { nombre } });
  if (existingPais) {
    throw new CustomError('El país ya existe', 409); // Conflict
  }
  return await Pais.create({ nombre });
};

const createProvincia = async (nombre, paisId) => {
  const existingProvincia = await Provincia.findOne({
    where: { nombre, paisId },
  });
  if (existingProvincia) {
    throw new CustomError('La provincia ya existe en este país', 409); // Conflict
  }
  const pais = await Pais.findByPk(paisId);
  if (!pais) {
    throw new CustomError('El país no existe', 404); // Not Found
  }
  return await Provincia.create({ nombre, paisId });
};

const createCiudad = async (nombre, provinciaId, codigoPostal) => {
  const provincia = await Provincia.findByPk(provinciaId);
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  if (!codigoPostal) {
    throw new CustomError(
      'El código postal es requerido para crear una ciudad',
      400,
    ); // Bad Request
  }
  const existingCiudad = await Ciudad.findOne({
    where: { nombre, provinciaId },
  });
  if (existingCiudad) {
    throw new CustomError('La ciudad ya existe en esta provincia', 409); // Conflict
  }
  const existingCodigoPostal = await Ciudad.findOne({
    where: { codigoPostal },
  });
  if (existingCodigoPostal) {
    throw new CustomError('El código postal ya existe', 409); // Conflict
  }
  return await Ciudad.create({ nombre, provinciaId, codigoPostal });
};

const updatePais = async (id, nombre) => {
  const pais = await Pais.findByPk(id);
  if (!pais) {
    throw new CustomError('El país no existe', 404); // Not Found
  }
  pais.nombre = nombre;
  await pais.save();
  return pais;
};

const updateProvincia = async (id, nombre, paisId) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  provincia.nombre = nombre;
  provincia.paisId = paisId;
  await provincia.save();
  return provincia;
};

const updateCiudad = async (id, nombre, provinciaId, codigoPostal) => {
  const ciudad = await Ciudad.findByPk(id);
  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
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
    throw new CustomError('El país no existe', 404); // Not Found
  }
  await pais.destroy();
  return pais;
};

const deleteProvincia = async (id) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  await provincia.destroy();
  return provincia;
};

const deleteCiudad = async (id) => {
  const ciudad = await Ciudad.findByPk(id);
  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
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
    throw new CustomError('El país no existe', 404); // Not Found
  }
  return await Provincia.findAll({ where: { paisId } });
};

const obtenerCiudades = async (provinciaId) => {
  const provincia = await Provincia.findByPk(provinciaId);
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  return await Ciudad.findAll({ where: { provinciaId } });
};

const obtenerPaisPorId = async (id) => {
  const pais = await Pais.findByPk(id);
  if (!pais) {
    throw new CustomError('El país no existe', 404); // Not Found
  }
  return pais;
};

const obtenerProvinciaPorId = async (id) => {
  const provincia = await Provincia.findByPk(id);
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  return provincia;
};

const obtenerCiudadPorId = async (id) => {
  const ciudad = await Ciudad.findByPk(id);
  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }
  return ciudad;
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
  obtenerCiudades,
  obtenerPaisPorId,
  obtenerProvinciaPorId,
  obtenerCiudadPorId,
};
