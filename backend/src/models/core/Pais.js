const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Pais = sequelize.define(
  'Pais',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'paises',
    timestamps: false,
  },
);

module.exports = Pais;
