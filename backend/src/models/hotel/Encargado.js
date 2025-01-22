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
      type: DataTypes.ENUM('dni', 'li', 'le', 'pasaporte'),
      allowNull: false,
    },
  },
  {
    tableName: 'encargados',
    timestamps: false,
  },
);

module.exports = Encargado;
