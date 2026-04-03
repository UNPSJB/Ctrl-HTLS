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
      validate: { isEmail: true },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'hoteles',
    timestamps: false,
  },
);

module.exports = Hotel;
