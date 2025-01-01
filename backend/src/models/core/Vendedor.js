const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Vendedor = sequelize.define(
  'Vendedor',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // Opcional
    },
    tipoDocumento: {
      type: DataTypes.ENUM('DNI', 'LI', 'LE', 'Pasaporte'),
      allowNull: false,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada número de documento debe ser único
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'vendedores',
    timestamps: false,
  },
);

module.exports = Vendedor;
