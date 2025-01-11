const Administrador = require('../../models/Administrador');
const Cliente = require('../../models/Cliente');
const Vendedor = require('../../models/Vendedor');
const Usuario = require('../../models/Usuario');
const CustomError = require('../../utils/CustomError');

const crearAdministrador = async (data) => {
  const {
    nombre,
    apellido,
    tipoDocumento,
    numeroDocumento,
    direccion,
    email,
    telefono = null,
  } = data;
  // Verificar si el email ya existe
  const existingEmail = await Administrador.findOne({ where: { email } });
  if (existingEmail) {
    throw new CustomError('El email ya está registrado', 409); // Conflict
  }

  // Verificar si el número de documento ya existe
  const existingDocumento = await Administrador.findOne({
    where: { numeroDocumento },
  });
  if (existingDocumento) {
    throw new CustomError('El número de documento ya está registrado', 409); // Conflict
  }

  // Crear el nuevo administrador
  const administrador = await Administrador.create({
    nombre,
    apellido,
    tipoDocumento,
    numeroDocumento,
    direccion,
    email,
    telefono,
  });

  return administrador;
};

module.exports = { crearAdministrador };
