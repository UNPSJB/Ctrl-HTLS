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

module.exports = {
  loginController,
  logoutController,
};
