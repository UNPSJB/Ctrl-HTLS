const Pais = require('../../models/core/Pais');
const Provincia = require('../../models/core/Provincia');
const Ciudad = require('../../models/core/Ciudad');
const Hotel = require('../../models/hotel/Hotel');
const Empleado = require('../../models/core/Empleado');
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
  const pais = await Pais.findByPk(id, {
    include: [{ model: Provincia, as: 'provincias' }],
  });
  if (!pais) {
    throw new CustomError('El país no existe', 404); // Not Found
  }
  if (pais.provincias && pais.provincias.length > 0) {
    throw new CustomError(
      'No se puede eliminar el país porque tiene provincias asociadas',
      409,
    ); // Conflict
  }
  await pais.destroy();
  return pais;
};

const deleteProvincia = async (id) => {
  const provincia = await Provincia.findByPk(id, {
    include: [{ model: Ciudad, as: 'ciudades' }],
  });
  if (!provincia) {
    throw new CustomError('La provincia no existe', 404); // Not Found
  }
  if (provincia.ciudades && provincia.ciudades.length > 0) {
    throw new CustomError(
      'No se puede eliminar la provincia porque tiene ciudades asociadas',
      409,
    ); // Conflict
  }
  await provincia.destroy();
  return provincia;
};

const deleteCiudad = async (id) => {
  const ciudad = await Ciudad.findByPk(id, {
    include: [
      { model: Hotel, as: 'hoteles' },
      { model: Empleado, as: 'empleados' },
    ],
  });
  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }
  const hasHoteles = ciudad.hoteles && ciudad.hoteles.length > 0;
  const hasEmpleados = ciudad.empleados && ciudad.empleados.length > 0;

  if (hasHoteles || hasEmpleados) {
    const associatedEntities = [];
    if (hasHoteles) associatedEntities.push('hoteles');
    if (hasEmpleados) associatedEntities.push('empleados');
    throw new CustomError(
      `No se puede eliminar la ciudad porque tiene ${associatedEntities.join(' y ')} asociados`,
      409,
    ); // Conflict
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
