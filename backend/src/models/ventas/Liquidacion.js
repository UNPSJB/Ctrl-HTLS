const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Liquidacion = sequelize.define(
  'Liquidacion',
  {
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'liquidaciones',
    timestamps: false,
  },
);

module.exports = Liquidacion;
