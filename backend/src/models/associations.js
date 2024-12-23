const Pais = require('./core/Pais');
const Provincia = require('./core/Provincia');
const Ciudad = require('./core/Ciudad');
const Cliente = require('./core/Cliente');
const Direccion = require('./core/Direccion');

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

//Relacion uno a muchos (Ciudad -> Direccion)
Direccion.belongsTo(Ciudad, {
  foreignKey: 'ciudadId', // Especificamos la clave foránea
  as: 'ciudad', // Alias para la relación inversa
});

Ciudad.hasMany(Direccion, {
  foreignKey: 'ciudadId', // Aseguramos que la clave coincida
  as: 'direcciones', // Alias para acceder a las direcciones de una ciudad
});

// Relación uno a uno (Cliente -> Dirección)
Cliente.belongsTo(Direccion, {
  foreignKey: 'direccionId', // Clave foránea en Cliente que apunta a Dirección
  as: 'direccion', // Alias para acceder a la dirección de un cliente
});

Direccion.hasOne(Cliente, {
  foreignKey: 'direccionId', // Clave foránea que coincide
  as: 'cliente', // Alias para acceder al cliente asociado con una dirección
});
