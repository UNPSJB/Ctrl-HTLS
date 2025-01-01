const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Servicio = sequelize.define(
  'Servicio',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'servicios',
    timestamps: false,
  },
);

module.exports = Servicio;
