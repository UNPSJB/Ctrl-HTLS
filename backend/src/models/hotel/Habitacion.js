const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Habitacion = sequelize.define(
  'Habitacion',
  {
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    piso: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'habitaciones',
    timestamps: false,
  },
);

module.exports = Habitacion;
