const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Encargado = sequelize.define(
  'Encargado',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM('dni', 'lc', 'le', 'pasaporte'),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // o false si lo querés obligatorio
    },
  },
  {
    tableName: 'encargados',
    timestamps: false,
  },
);

module.exports = Encargado;
