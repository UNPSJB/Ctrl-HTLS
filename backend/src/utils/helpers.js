const Ciudad = require('../models/core/Ciudad');
const Cliente = require('../models/core/Cliente');
const Empleado = require('../models/core/Empleado');
const Hotel = require('../models/hotel/Hotel');

const CustomError = require('./CustomError');

const verificarCiudad = async (ciudadId) => {
  const ciudadExistente = await Ciudad.findByPk(ciudadId);
  if (!ciudadExistente) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }
};

const verificarEmail = async (email) => {
  // Verificar si ya existe un hotel con el mismo email
  const hotelExistenteEmail = await Hotel.findOne({
    where: { email },
  });
  if (hotelExistenteEmail) {
    throw new CustomError('Ya existe un hotel con el mismo email', 409); // Conflict
  }
  const clienteExistenteEmail = await Cliente.findOne({
    where: { email },
  });
  if (clienteExistenteEmail) {
    throw new CustomError('Ya existe un cliente con el mismo email', 409); // Conflict
  }
  const empleadoExistenteEmail = await Empleado.findOne({
    where: { email },
  });
  if (empleadoExistenteEmail) {
    throw new CustomError('Ya existe un empleado con el mismo email', 409); // Conflict
  }
};

const verificarTelefono = async (telefono) => {
  // Verificar si ya existe un hotel con el mismo telefono
  const hotelExistenteTelefono = await Hotel.findOne({
    where: { telefono },
  });
  if (hotelExistenteTelefono) {
    throw new CustomError('Ya existe un hotel con el mismo telefono', 409); // Conflict
  }
  const clienteExistenteTelefono = await Cliente.findOne({
    where: { telefono },
  });
  if (clienteExistenteTelefono) {
    throw new CustomError('Ya existe un cliente con el mismo telefono', 409); // Conflict
  }
  const empleadoExistenteTelefono = await Empleado.findOne({
    where: { telefono },
  });
  if (empleadoExistenteTelefono) {
    throw new CustomError('Ya existe un empleado con el mismo telefono', 409); // Conflict
  }
};

const verificarDireccion = async (direccion, ciudadId) => {
  // Verificar si ya existe un hotel con la misma dirección
  const hotelExistenteDireccion = await Hotel.findOne({
    where: { direccion, ciudadId },
  });
  if (hotelExistenteDireccion) {
    throw new CustomError('Ya existe un hotel con la misma dirección', 409); // Conflict
  }

  // Verificar si ya existe un empleado con la misma dirección
  const empleadoExistenteDireccion = await Empleado.findOne({
    where: { direccion, ciudadId },
  });
  if (empleadoExistenteDireccion) {
    throw new CustomError('Ya existe un empleado con la misma dirección', 409); // Conflict
  }
};

module.exports = {
  verificarCiudad,
  verificarEmail,
  verificarTelefono,
  verificarDireccion,
};
