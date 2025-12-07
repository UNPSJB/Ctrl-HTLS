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

module.exports = { login };
