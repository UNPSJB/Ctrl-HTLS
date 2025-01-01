const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AlquilerHabitacion = sequelize.define(
  'AlquilerHabitacion',
  {
    alquilerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Alquiler',
        key: 'id',
      },
    },
    habitacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Habitacion',
        key: 'id',
      },
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'alquiler_habitacion',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['habitacionId', 'fechaInicio', 'fechaFin'],
      },
    ],
  },
);

module.exports = AlquilerHabitacion;
