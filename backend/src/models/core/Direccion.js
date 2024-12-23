const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Direccion = sequelize.define(
  'Direccion',
  {
    calle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'direcciones',
    timestamps: false,
  },
);

module.exports = Direccion;
