const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Hotel = sequelize.define(
  'Hotel',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'hoteles',
    timestamps: false,
  },
);

module.exports = Hotel;
