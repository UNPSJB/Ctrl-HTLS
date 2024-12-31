const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PaquetePromocionalHabitacion = sequelize.define(
  'PaquetePromocionalHabitacion',
  {
    paquetePromocionalId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PaquetePromocional',
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
    tableName: 'paquete_promocional_habitacion',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['habitacionId', 'fechaInicio', 'fechaFin'],
      },
    ],
  },
);

module.exports = PaquetePromocionalHabitacion;
