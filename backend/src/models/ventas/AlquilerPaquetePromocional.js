const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AlquilerPaquetePromocional = sequelize.define(
  'AlquilerPaquetePromocional',
  {
    alquilerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Alquiler',
        key: 'id',
      },
    },
    paquetePromocionalId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PaquetePromocional',
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
    tableName: 'alquileres_paquetes_promocionales',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['paquetePromocionalId', 'fechaInicio', 'fechaFin'],
        name: 'idx_alquiler_paquete_fecha',
      },
    ],
  },
);

module.exports = AlquilerPaquetePromocional;
