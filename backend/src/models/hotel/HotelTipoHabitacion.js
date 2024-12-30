const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelTipoHabitacion = sequelize.define(
  'HotelTipoHabitacion',
  {
    hotelId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Hotel',
        key: 'id',
      },
    },
    tipoHabitacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TipoHabitacion',
        key: 'id',
      },
    },
  },
  {
    tableName: 'hotel_tipo_habitacion',
    timestamps: false,
  },
);

module.exports = HotelTipoHabitacion;
