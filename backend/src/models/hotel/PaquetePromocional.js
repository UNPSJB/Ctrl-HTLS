const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const PaquetePromocional = sequelize.define(
  'PaquetePromocional',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    coeficiente_descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'paquetes_promocionales',
    timestamps: false,
  },
);

module.exports = PaquetePromocional;
