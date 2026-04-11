const authService = require('../../services/auth/authServices');

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Por favor ingresa email y contraseña.' });
  }

  try {
    const { accessToken, empleado } = await authService.login(email, password);

    return res.status(200).json({ accessToken, empleado });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

const logoutController = (req, res) => {
  res.clearCookie('accessToken');
  return res.status(200).json({ message: 'Logout exitoso' });
};

const changePasswordController = async (req, res) => {
  const { empleadoId, contrasenaActual, contrasenaNueva, confirmarContrasena } =
    req.body;

  if (
    !empleadoId ||
    !contrasenaActual ||
    !contrasenaNueva ||
    !confirmarContrasena
  ) {
    return res.status(400).json({
      message:
        'Por favor ingresa empleadoId, contrasenaActual, contrasenaNueva y confirmarContrasena.',
    });
  }

  try {
    const result = await authService.changePassword(
      empleadoId,
      contrasenaActual,
      contrasenaNueva,
      confirmarContrasena,
    );

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  loginController,
  logoutController,
  changePasswordController,
};
