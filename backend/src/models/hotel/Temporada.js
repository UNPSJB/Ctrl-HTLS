const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Temporada = sequelize.define(
  'Temporada',
  {
    tipo: {
      type: DataTypes.ENUM('ALTA', 'BAJA'),
      allowNull: false,
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
    tableName: 'temporadas',
    timestamps: false,
  },
);

module.exports = Temporada;
