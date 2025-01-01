const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Descuento = sequelize.define(
  'Descuento',
  {
    porcentaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad_de_habitaciones: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'descuentos',
    timestamps: false,
  },
);

module.exports = Descuento;
