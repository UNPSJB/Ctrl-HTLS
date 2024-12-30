const Pais = require('./core/Pais');
const Provincia = require('./core/Provincia');
const Ciudad = require('./core/Ciudad');
const Cliente = require('./core/Cliente');
const Hotel = require('./hotel/Hotel');
const TipoHabitacion = require('./hotel/TipoHabitacion');
const HotelTipoHabitacion = require('./hotel/HotelTipoHabitacion');

// Relación uno a muchos (Pais -> Provincia)
Provincia.belongsTo(Pais, {
  foreignKey: 'paisId', // Especificamos la clave foránea
  as: 'pais', // Alias para la relación inversa
});

Pais.hasMany(Provincia, {
  foreignKey: 'paisId', // Aseguramos que la clave coincida
  as: 'provincias', // Alias para acceder a las provincias de un país
});

// Relación uno a muchos (Provincia -> Ciudad)
Ciudad.belongsTo(Provincia, {
  foreignKey: 'provinciaId', // Especificamos la clave foránea
  as: 'provincia', // Alias para la relación inversa
});

Provincia.hasMany(Ciudad, {
  foreignKey: 'provinciaId', // Aseguramos que la clave coincida
  as: 'ciudades', // Alias para acceder a las ciudades de una provincia
});

// Relación uno a muchos (Ciudad -> Cliente)
Cliente.belongsTo(Ciudad, {
  foreignKey: 'ciudadId', // Clave foránea en Cliente que apunta a Ciudad
  as: 'ciudad', // Alias para acceder a la ciudad de un cliente
});

Ciudad.hasMany(Cliente, {
  foreignKey: 'ciudadId', // Aseguramos que la clave coincida
  as: 'clientes', // Alias para acceder a los clientes de una ciudad
});

/*******ASOCIACIONES DE HOTEL*******/

// Relación muchos a muchos (Hotel -> TipoHabitacion)
Hotel.belongsToMany(TipoHabitacion, {
  through: HotelTipoHabitacion,
  foreignKey: 'hotelId',
  otherKey: 'tipoHabitacionId',
  as: 'tiposHabitacion',
});

TipoHabitacion.belongsToMany(Hotel, {
  through: HotelTipoHabitacion,
  foreignKey: 'tipoHabitacionId',
  otherKey: 'hotelId',
  as: 'hoteles',
});

// Relación uno a muchos (Ciudad -> Hotel)
Hotel.belongsTo(Ciudad, {
  foreignKey: 'ciudadId',
  as: 'ciudad',
});

Ciudad.hasMany(Hotel, {
  foreignKey: 'ciudadId',
  as: 'hoteles',
});
