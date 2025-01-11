const { validationResult } = require('express-validator');
const localidadService = require('../../services/core/localidadServices');

const handleLocalidad = async (
  tipo,
  nombre,
  paisId,
  provinciaId,
  codigoPostal,
  operation,
  id = null,
) => {
  let localidad;
  switch (tipo) {
    case 'pais':
      if (operation === 'create') {
        localidad = await localidadService.createPais(nombre);
      } else if (operation === 'update') {
        localidad = await localidadService.updatePais(id, nombre);
      } else if (operation === 'delete') {
        localidad = await localidadService.deletePais(id);
      }
      break;
    case 'provincia':
      if (!paisId && (operation === 'create' || operation === 'update')) {
        throw new Error(
          'paisId es requerido para crear o actualizar una provincia',
        );
      }
      if (operation === 'create') {
        localidad = await localidadService.createProvincia(nombre, paisId);
      } else if (operation === 'update') {
        localidad = await localidadService.updateProvincia(id, nombre, paisId);
      } else if (operation === 'delete') {
        localidad = await localidadService.deleteProvincia(id);
      }
      break;
    case 'ciudad':
      if (!provinciaId && (operation === 'create' || operation === 'update')) {
        throw new Error(
          'provinciaId es requerido para crear o actualizar una ciudad',
        );
      }
      if (!codigoPostal && (operation === 'create' || operation === 'update')) {
        throw new Error(
          'El código postal es requerido para crear o actualizar una ciudad',
        );
      }
      if (operation === 'create') {
        localidad = await localidadService.createCiudad(
          nombre,
          provinciaId,
          codigoPostal,
        );
      } else if (operation === 'update') {
        localidad = await localidadService.updateCiudad(
          id,
          nombre,
          provinciaId,
          codigoPostal,
        );
      } else if (operation === 'delete') {
        localidad = await localidadService.deleteCiudad(id);
      }
      break;
    default:
      throw new Error('Tipo de localidad no válido');
  }
  return localidad;
};

const createLocalidad = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tipo, nombre, paisId, provinciaId, codigoPostal } = req.body;

  try {
    const localidad = await handleLocalidad(
      tipo,
      nombre,
      paisId,
      provinciaId,
      codigoPostal,
      'create',
    );
    res.status(201).json(localidad);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const updateLocalidad = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { tipo, nombre, paisId, provinciaId, codigoPostal } = req.body;

  try {
    const localidad = await handleLocalidad(
      tipo,
      nombre,
      paisId,
      provinciaId,
      codigoPostal,
      'update',
      id,
    );
    res.status(200).json(localidad);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const deleteLocalidad = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  try {
    await handleLocalidad(tipo, null, null, null, null, 'delete', id);
    res.status(200).json({ message: 'Localidad eliminada correctamente' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getPaises = async (req, res) => {
  try {
    const paises = await localidadService.obtenerPaises();
    if (paises.length === 0) {
      return res.status(404).json({ message: 'No se encontraron países' });
    }
    res.status(200).json(paises);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getProvincias = async (req, res) => {
  const { paisId } = req.params;
  if (!paisId) {
    return res.status(400).json({ message: 'paisId es requerido' });
  }
  try {
    const provincias = await localidadService.obtenerProvincias(paisId);
    if (provincias.length === 0) {
      return res.status(404).json({ message: 'No se encontraron provincias' });
    }
    res.status(200).json(provincias);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getCiudades = async (req, res) => {
  const { provinciaId } = req.params;
  if (!provinciaId) {
    return res.status(400).json({ message: 'provinciaId es requerido' });
  }
  try {
    const ciudades = await localidadService.obtenerCiudades(provinciaId);
    if (ciudades.length === 0) {
      return res.status(404).json({ message: 'No se encontraron ciudades' });
    }
    res.status(200).json(ciudades);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getPaisById = async (req, res) => {
  const { id } = req.params;
  try {
    const pais = await localidadService.obtenerPaisPorId(id);
    if (!pais) {
      return res.status(404).json({ message: 'No se encontró el país' });
    }
    res.status(200).json(pais);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getProvinciaById = async (req, res) => {
  const { id } = req.params;
  try {
    const provincia = await localidadService.obtenerProvinciaPorId(id);
    if (!provincia) {
      return res.status(404).json({ message: 'No se encontró la provincia' });
    }
    res.status(200).json(provincia);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getCiudadById = async (req, res) => {
  const { id } = req.params;
  try {
    const ciudad = await localidadService.obtenerCiudadPorId(id);
    if (!ciudad) {
      return res.status(404).json({ message: 'No se encontró la ciudad' });
    }
    res.status(200).json(ciudad);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  createLocalidad,
  updateLocalidad,
  deleteLocalidad,
  getPaises,
  getProvincias,
  getCiudades,
  getPaisById,
  getProvinciaById,
  getCiudadById,
};
