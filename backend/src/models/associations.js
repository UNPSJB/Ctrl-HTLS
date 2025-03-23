const Pais = require('./core/Pais');
const Provincia = require('./core/Provincia');
const Ciudad = require('./core/Ciudad');
const Cliente = require('./core/Cliente');
const Hotel = require('./hotel/Hotel');
const TipoHabitacion = require('./hotel/TipoHabitacion');
const HotelTipoHabitacion = require('./hotel/HotelTipoHabitacion');
const Habitacion = require('./hotel/Habitacion');
const PaquetePromocional = require('./hotel/PaquetePromocional');
const PaquetePromocionalHabitacion = require('./hotel/PaquetePromocionalHabitacion');
const Encargado = require('./hotel/Encargado');
const Categoria = require('./hotel/Categoria');
const Temporada = require('./hotel/Temporada');
const Descuento = require('./hotel/Descuento');
const Empleado = require('./core/Empleado');
const HotelEmpleado = require('./hotel/HotelEmpleado');
const Factura = require('./ventas/Factura');
const DetalleFactura = require('./ventas/DetalleFactura');
const Liquidacion = require('./ventas/Liquidacion');
const Servicio = require('./hotel/Servicio');
const CategoriaServicio = require('./hotel/CategoriaServicio');
const Alquiler = require('./ventas/Alquiler');
const AlquilerHabitacion = require('./ventas/AlquilerHabitacion');
const Pago = require('./ventas/Pago');
const AlquilerPaquetePromocional = require('./ventas/AlquilerPaquetePromocional');
// const Administrador = require('./core/Administrador');
// const Usuario = require('./core/Usuario');

//#region ASOCIACIONES DE LOCALIDADES

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

// Relación uno a muchos (Ciudad -> Empleado)
Empleado.belongsTo(Ciudad, {
  foreignKey: 'ciudadId',
  as: 'ciudad',
});

Ciudad.hasMany(Empleado, {
  foreignKey: 'ciudadId',
  as: 'empleados',
});

//#endregion

//#region ASOCIACIONES DE HOTEL

// Relación muchos a muchos (Hotel <-> TipoHabitacion)
Hotel.belongsToMany(TipoHabitacion, {
  through: HotelTipoHabitacion,
  foreignKey: 'hotelId',
  otherKey: 'tipoHabitacionId',
  as: 'tiposHabitacion',
  onDelete: 'CASCADE',
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

// Relación uno a muchos (Habitacion -> Hotel)
Habitacion.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  as: 'hotel',
});

Hotel.hasMany(Habitacion, {
  foreignKey: 'hotelId',
  as: 'habitaciones',
});

// Relación uno a muchos (Hotel -> PaquetePromocional)
PaquetePromocional.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  as: 'hotel',
});

Hotel.hasMany(PaquetePromocional, {
  foreignKey: 'hotelId',
  as: 'paquetesPromocionales',
});

// Relación uno a uno (Encargado -> Hotel)
Hotel.belongsTo(Encargado, {
  foreignKey: {
    name: 'encargadoId',
    allowNull: true,
  },
  as: 'encargado',
});

Encargado.hasOne(Hotel, {
  foreignKey: 'encargadoId',
  as: 'hotel',
});

// Relación uno a muchos (Categoria -> Hotel)
Hotel.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria',
});

Categoria.hasMany(Hotel, {
  foreignKey: 'categoriaId',
  as: 'hoteles',
});

// Relación uno a muchos (Temporada -> Hotel)
Hotel.hasMany(Temporada, {
  foreignKey: 'hotelId',
  as: 'temporadas',
});

Temporada.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  as: 'hotel',
});

// Relación uno a muchos (Descuento -> Hotel)
Hotel.hasMany(Descuento, {
  foreignKey: 'hotelId',
  as: 'descuentos',
});

Descuento.belongsTo(Hotel, {
  foreignKey: 'hotelId',
  as: 'hotel',
});

// Relación muchos a muchos (Hotel -> Empleado)
Hotel.belongsToMany(Empleado, {
  through: HotelEmpleado,
  foreignKey: 'hotelId',
  otherKey: 'empleadoId',
  as: 'empleados',
});

Empleado.belongsToMany(Hotel, {
  through: HotelEmpleado,
  foreignKey: 'empleadoId',
  otherKey: 'hotelId',
  as: 'hoteles',
});

// Relación muchos a muchos (Categoria -> Servicio)
Categoria.belongsToMany(Servicio, {
  through: CategoriaServicio,
  foreignKey: 'categoriaid',
  otherKey: 'servicioid',
  as: 'servicios',
});

Servicio.belongsToMany(Categoria, {
  through: CategoriaServicio,
  foreignKey: 'servicioid',
  otherKey: 'categoriaid',
  as: 'categorias',
});

// Relación uno a uno (Factura -> Pago)
Factura.belongsTo(Pago, {
  foreignKey: {
    name: 'pagoId',
    allowNull: false,
  },
  as: 'pago',
});

Pago.hasOne(Factura, {
  foreignKey: 'pagoId',
  as: 'factura',
});

//#endregion

//#region ASOCIACIONES DE HABITACION

// Relación uno a muchos (Habitacion -> TipoHabitacion)
Habitacion.belongsTo(TipoHabitacion, {
  foreignKey: 'tipoHabitacionId',
  as: 'tipoHabitacion',
});

TipoHabitacion.hasMany(Habitacion, {
  foreignKey: 'tipoHabitacionId',
  as: 'habitaciones',
});

// Relación muchos a muchos (PaquetePromocional -> Habitacion)
PaquetePromocional.belongsToMany(Habitacion, {
  through: PaquetePromocionalHabitacion,
  foreignKey: 'paquetePromocionalId',
  otherKey: 'habitacionId',
  as: 'habitaciones',
});

Habitacion.belongsToMany(PaquetePromocional, {
  through: PaquetePromocionalHabitacion,
  foreignKey: 'habitacionId',
  otherKey: 'paquetePromocionalId',
  as: 'paquetesPromocionales',
});

//#endregion

//#region ASOCIACIONES DE VENTAS

// Relación uno a muchos (Factura -> DetalleFactura)
Factura.hasMany(DetalleFactura, {
  foreignKey: 'facturaId',
  as: 'detalles',
  onDelete: 'CASCADE', // Si se elimina la factura, también se eliminan los detalles
});

DetalleFactura.belongsTo(Factura, {
  foreignKey: 'facturaId',
  as: 'factura',
});

// Relación uno a muchos (Liquidacion -> DetalleFactura)
Liquidacion.hasMany(DetalleFactura, {
  foreignKey: 'liquidacionId',
  as: 'detallesFactura',
});

DetalleFactura.belongsTo(Liquidacion, {
  foreignKey: {
    name: 'liquidacionId',
    allowNull: true,
  },
  as: 'liquidacion',
});

// Relación uno a muchos (Empleado -> Liquidacion)
Empleado.hasMany(Liquidacion, {
  foreignKey: 'empleadoId',
  as: 'liquidaciones',
});

Liquidacion.belongsTo(Empleado, {
  foreignKey: 'empleadoId',
  as: 'empleado',
});

// Relación muchos a muchos (Alquiler -> Habitacion)
Alquiler.belongsToMany(Habitacion, {
  through: AlquilerHabitacion,
  foreignKey: 'alquilerId',
  otherKey: 'habitacionId',
  as: 'habitaciones',
});

Habitacion.belongsToMany(Alquiler, {
  through: AlquilerHabitacion,
  foreignKey: 'habitacionId',
  otherKey: 'alquilerId',
  as: 'alquileres',
});

// Relación muchos a muchos (Alquiler -> PaquetePromocional)
Alquiler.belongsToMany(PaquetePromocional, {
  through: 'AlquilerPaquetePromocional',
  foreignKey: 'alquilerId',
  otherKey: 'paquetePromocionalId',
  as: 'paquetesPromocionales',
});

PaquetePromocional.belongsToMany(Alquiler, {
  through: 'AlquilerPaquetePromocional',
  foreignKey: 'paquetePromocionalId',
  otherKey: 'alquilerId',
  as: 'alquileres',
});

// Relación uno a muchos (Cliente -> Alquiler)
Cliente.hasMany(Alquiler, {
  foreignKey: 'clienteId',
  as: 'alquileres',
});

Alquiler.belongsTo(Cliente, {
  foreignKey: 'clienteId',
  as: 'cliente',
});

// Relación uno a uno (Alquiler -> DetalleFactura)
Alquiler.hasOne(DetalleFactura, {
  foreignKey: 'alquilerId',
  as: 'detalleFactura',
});

DetalleFactura.belongsTo(Alquiler, {
  foreignKey: 'alquilerId',
  as: 'alquiler',
});

// Relación uno a muchos (Empleado -> DetalleFactura)
Empleado.hasMany(DetalleFactura, {
  foreignKey: 'empleadoId',
  as: 'detallesFactura',
});

DetalleFactura.belongsTo(Empleado, {
  foreignKey: 'empleadoId',
  as: 'empleado',
});

//#endregion
