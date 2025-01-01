const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CategoriaServicio = sequelize.define(
  'CategoriaServicio',
  {
    categoriaId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Categoria',
        key: 'id',
      },
    },
    servicioId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Servicio',
        key: 'id',
      },
    },
  },
  {
    tableName: 'categoria_servicio',
    timestamps: false,
  },
);

module.exports = CategoriaServicio;
