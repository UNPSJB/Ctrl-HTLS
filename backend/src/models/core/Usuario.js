const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    rol: {
      type: DataTypes.ENUM('Administrador', 'Vendedor', 'Desarrollador'),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: false,
  },
);

module.exports = Usuario;
