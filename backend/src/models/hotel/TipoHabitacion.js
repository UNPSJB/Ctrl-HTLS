const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TipoHabitacion = sequelize.define(
  'TipoHabitacion',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tipos_habitacion',
    timestamps: false,
  },
);

module.exports = TipoHabitacion;
