const Ciudad = require('../models/core/Ciudad');
const Cliente = require('../models/core/Cliente');
const Empleado = require('../models/core/Empleado');
const Hotel = require('../models/hotel/Hotel');
const TipoHabitacion = require('../models/hotel/TipoHabitacion');

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

const verificarTiposHabitacion = async (tipoHabitaciones) => {
  const idsTipoHabitacion = tipoHabitaciones.map((th) => th.idTipoHabitacion);

  // Verificar si hay IDs duplicados
  const idsUnicos = new Set(idsTipoHabitacion);
  if (idsUnicos.size !== idsTipoHabitacion.length) {
    throw new CustomError(
      'No puedes asignar tipos de habitacion repetidos.',
      400,
    ); // Bad Request
  }

  // Verificar si todos los tipos de habitación existen
  const tiposHabitacionExistentes = await TipoHabitacion.findAll({
    where: { id: idsTipoHabitacion },
    attributes: ['id'],
  });

  if (tiposHabitacionExistentes.length !== idsTipoHabitacion.length) {
    throw new CustomError(
      'Uno o más IDs de tipos de habitación no existen',
      404,
    ); // Not Found
  }
};

const verificarFechas = (fechaInicio, fechaFin) => {
  const fechaInicioDate = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);
  const fechaActual = new Date();

  if (fechaInicioDate < fechaActual) {
    throw new CustomError(
      'La fecha de inicio debe ser mayor a la fecha actual',
      400,
    ); // Bad Request
  }
  if (fechaInicioDate >= fechaFinDate) {
    throw new CustomError(
      'La fecha de inicio debe ser menor a la fecha de fin',
      400,
    ); // Bad Request
  }
};

const verificarIdHotel = async (hotelId) => {
  const hotelExistente = await Hotel.findByPk(hotelId);
  if (!hotelExistente) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }
};

const convertirFechas = (fecha) => {
  const fechaFormateada = new Date(fecha);

  return fechaFormateada;
};

const verificarPorcentaje = (porcentaje) => {
  if (porcentaje <= 0 || porcentaje > 100) {
    throw new CustomError('El porcentaje debe estar entre 1 y 100', 400); // Bad Request
  }
};

module.exports = {
  convertirFechas,
  verificarCiudad,
  verificarEmail,
  verificarIdHotel,
  verificarFechas,
  verificarTelefono,
  verificarDireccion,
  verificarPorcentaje,
  verificarTiposHabitacion,
};
