const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Pago = sequelize.define(
  'Pago',
  {
    importe: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tipo_pago: {
      type: DataTypes.ENUM('Efectivo', 'Tarjeta', 'Mixto', 'Puntos'),
      allowNull: false,
    },
    importe_efectivo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    importe_tarjeta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: 'pagos',
    timestamps: false,
  },
);

module.exports = Pago;
