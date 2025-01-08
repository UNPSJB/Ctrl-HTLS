const { validationResult } = require('express-validator');
const localidadService = require('../../services/core/localidadServices');

const createLocalidad = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tipo, nombre, paisId, provinciaId, codigoPostal } = req.body;

  try {
    let localidad;
    switch (tipo) {
      case 'pais':
        localidad = await localidadService.createPais(nombre);
        break;
      case 'provincia':
        if (!paisId) {
          return res
            .status(400)
            .json({ error: 'paisId es requerido para crear una provincia' });
        }
        localidad = await localidadService.createProvincia(nombre, paisId);
        break;
      case 'ciudad':
        if (!provinciaId) {
          return res
            .status(400)
            .json({ error: 'provinciaId es requerido para crear una ciudad' });
        }
        if (!codigoPostal) {
          return res.status(400).json({
            error: 'El código postal es requerido para crear una ciudad',
          });
        }
        localidad = await localidadService.createCiudad(
          nombre,
          provinciaId,
          codigoPostal,
        );
        break;
      default:
        return res.status(400).json({ error: 'Tipo de localidad no válido' });
    }

    res.status(201).json(localidad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaises = async (req, res) => {
  try {
    const paises = await localidadService.obtenerPaises();
    res.status(200).json(paises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createLocalidad, getPaises };
