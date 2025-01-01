const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Factura = sequelize.define(
  'Factura',
  {
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    tipo_factura: {
      type: DataTypes.ENUM('A', 'B', 'C'),
      allowNull: false,
    },
    importe_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'facturas',
    timestamps: false,
  },
);

module.exports = Factura;
