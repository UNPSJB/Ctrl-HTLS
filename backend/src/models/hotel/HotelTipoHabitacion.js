const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const HotelTipoHabitacion = sequelize.define(
  'HotelTipoHabitacion',
  {
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hotel',
        key: 'id',
      },
    },
    tipoHabitacionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TipoHabitacion',
        key: 'id',
      },
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: 'hotel_tipo_habitacion',
    timestamps: false,
  },
);

module.exports = HotelTipoHabitacion;
