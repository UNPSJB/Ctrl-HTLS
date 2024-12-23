const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Ciudad = sequelize.define(
  'Ciudad',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codigoPostal: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },

  {
    tableName: 'ciudades',
    timestamps: false,
  },
);

module.exports = Ciudad;
