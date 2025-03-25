const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario está autenticado
const verificarToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded; // Adjuntar usuario decodificado al objeto de la solicitud

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar si el usuario es administrador
const verificarAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== 'administrador') {
    return res
      .status(403)
      .json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Middleware para verificar si el usuario es cooperativa
const verificarCooperativa = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== 'cooperativa') {
    return res
      .status(403)
      .json({ message: 'Acceso denegado. Se requiere rol de cooperativa' });
  }
  next();
};

module.exports = { verificarToken, verificarCooperativa, verificarAdmin };
