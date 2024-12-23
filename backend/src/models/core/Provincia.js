const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Provincia = sequelize.define(
  'Provincia',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'provincias',
    timestamps: false,
  },
);

module.exports = Provincia;
