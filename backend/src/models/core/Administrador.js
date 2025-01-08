const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Administrador = sequelize.define(
  'Administrador',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.ENUM('DNI', 'LI', 'LE', 'Pasaporte'),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // Opcional
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      isEmail: true,
    },
  },

  {
    tableName: 'administradores',
    timestamps: false,
  },
);

module.exports = Administrador;
