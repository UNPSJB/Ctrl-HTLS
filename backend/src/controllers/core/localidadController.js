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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

const deleteLocalidad = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  try {
    await handleLocalidad(tipo, null, null, null, null, 'delete', id);
    res.status(200).json({ message: 'Localidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLocalidad,
  updateLocalidad,
  deleteLocalidad,
  getPaises,
  getProvincias,
};
