const Empleado = require('../../models/core/Empleado');
const Ciudad = require('../../models/core/Ciudad');
const CustomError = require('../../utils/CustomError');

const crearEmpleado = async (empleado) => {
  const {
    nombre,
    apellido,
    email,
    rol,
    password,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  } = empleado;

  // Verificar si el email ya existe
  const existingEmail = await Empleado.findOne({ where: { email } });
  if (existingEmail) {
    throw new CustomError('El email ya está registrado', 409); // Conflict
  }

  // Verificar si el número de documento ya existe
  const existingDocumento = await Empleado.findOne({
    where: { numeroDocumento },
  });
  if (existingDocumento) {
    throw new CustomError('El número de documento ya está registrado', 409); // Conflict
  }

  // Verificar si la ciudad existe
  const ciudad = await Ciudad.findByPk(ciudadId);
  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }

  // Crear el nuevo empleado
  const nuevoEmpleado = await Empleado.create({
    nombre,
    apellido,
    email,
    rol,
    password,
    telefono,
    tipoDocumento,
    numeroDocumento,
    direccion,
    ciudadId,
  });

  return nuevoEmpleado;
};

module.exports = { crearEmpleado };
