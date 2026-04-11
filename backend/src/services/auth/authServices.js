const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Empleado = require('../../models/core/Empleado');
const CustomError = require('../../utils/CustomError');

const generarAccessToken = (empleado) =>
  jwt.sign(
    {
      id: empleado.id,
      email: empleado.email,
      rol: empleado.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
  );

const login = async (email, password) => {
  const empleado = await Empleado.findOne({ where: { email } });
  if (!empleado) {
    throw new CustomError('Credenciales inválidas', 401);
  }

  const isMatch = await bcrypt.compare(password, empleado.password);
  if (!isMatch) {
    throw new CustomError('Credenciales inválidas', 401);
  }

  const token = generarAccessToken(empleado);

  return {
    accessToken: token,
    empleado: {
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      rol: empleado.rol,
    },
  };
};

const changePassword = async (
  empleadoId,
  contrasenaActual,
  contrasenaNueva,
  confirmarContrasena,
) => {
  // Validar que las nuevas contraseñas coincidan
  if (contrasenaNueva !== confirmarContrasena) {
    throw new CustomError('Las contraseñas nuevas no coinciden', 400);
  }

  // Buscar el empleado por ID
  const empleado = await Empleado.findByPk(empleadoId);
  if (!empleado) {
    throw new CustomError('Empleado no encontrado', 404);
  }

  // Validar la contraseña actual
  const isMatch = await bcrypt.compare(contrasenaActual, empleado.password);
  if (!isMatch) {
    throw new CustomError('La contraseña actual es incorrecta', 401);
  }

  // Hashear y guardar la nueva contraseña
  const hashedPassword = await bcrypt.hash(contrasenaNueva, 10);
  empleado.password = hashedPassword;
  await empleado.save();

  return { message: 'Contraseña actualizada exitosamente' };
};

module.exports = { login, changePassword };
