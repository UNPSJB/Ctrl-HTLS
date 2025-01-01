const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelVendedor = sequelize.define(
  'HotelVendedor',
  {
    hotelId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Hotel',
        key: 'id',
      },
    },
    vendedorId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Vendedor',
        key: 'id',
      },
    },
  },
  {
    tableName: 'hotel_vendedor',
    timestamps: false,
  },
);

module.exports = HotelVendedor;
