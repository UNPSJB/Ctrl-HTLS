const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelEmpleado = sequelize.define(
  'HotelEmpleado',
  {
    hotelId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Hotel',
        key: 'id',
      },
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'HotelEmpleado',
        key: 'id',
      },
    },
  },
  {
    tableName: 'hotel_empleado',
    timestamps: false,
  },
);

module.exports = HotelEmpleado;
