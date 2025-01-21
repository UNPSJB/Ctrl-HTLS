const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Cliente = sequelize.define(
  'Cliente',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM('dni', 'li', 'le', 'pasaporte'),
      allowNull: false,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada número de documento debe ser único
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true, // Validar que sea un email válido
      },
    },
    puntos: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Inicializamos con 0 puntos
    },
  },
  {
    tableName: 'clientes',
    timestamps: false, // Si no necesitas createdAt/updatedAt
  },
);

module.exports = Cliente;
