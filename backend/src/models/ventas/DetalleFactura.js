const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DetalleFactura = sequelize.define(
  'DetalleFactura',
  {
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'detalles_factura',
    timestamps: false,
  },
);

module.exports = DetalleFactura;
