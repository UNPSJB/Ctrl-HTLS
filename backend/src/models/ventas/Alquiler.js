const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Alquiler = sequelize.define(
  'Alquiler',
  {
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pasajeros: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    importe_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'alquileres',
    timestamps: false,
  },
);

module.exports = Alquiler;
