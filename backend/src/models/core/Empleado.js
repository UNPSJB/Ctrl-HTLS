const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Empleado = sequelize.define(
  'Empleado',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
    rol: {
      type: DataTypes.ENUM('administrador', 'vendedor', 'desarrollador'),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // Opcional
    },
    tipoDocumento: {
      type: DataTypes.ENUM('dni', 'li', 'le', 'pasaporte'),
      allowNull: false,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada número de documento debe ser único
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'empleados',
    timestamps: false,
  },
);

module.exports = Empleado;
