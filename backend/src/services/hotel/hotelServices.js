const Hotel = require('../../models/hotel/Hotel');
const {
  verificarCiudad,
  verificarDireccion,
  verificarEmail,
  verificarTelefono,
  verificarTiposHabitacion,
  verificarIdHotel,
  verificarFechas,
  verificarPorcentaje,
} = require('../../utils/helpers');
const { Op } = require('sequelize');
const CustomError = require('../../utils/CustomError');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const Categoria = require('../../models/hotel/Categoria');
const Encargado = require('../../models/hotel/Encargado');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
const Ciudad = require('../../models/core/Ciudad');
const Provincia = require('../../models/core/Provincia');
const Pais = require('../../models/core/Pais');
const Habitacion = require('../../models/hotel/Habitacion');
const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const AlquilerHabitacion = require('../../models/ventas/AlquilerHabitacion');
const paquetePromocionalServices = require('./paquetePromocionalServices');
const verificarDisponibilidad = require('../ventas/verificarDisponibilidad');
const { verificarHabitacionesHotel } = require('./habitacionServices');
const temporadaServices = require('./temporadaServices');
const descuentoServices = require('./descuentoServices');
const habitacionServices = require('./habitacionServices');

const crearHotel = async (
  nombre,
  direccion,
  telefono,
  email,
  tipoHabitaciones,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  await verificarCiudad(ciudadId);

  await verificarHotel(
    nombre,
    ciudadId,
    direccion,
    email,
    telefono,
    encargadoId,
    categoriaId,
  );
  let nuevoHotel = {};
  try {
    // Crear el nuevo hotel
    nuevoHotel = await Hotel.create({
      nombre,
      direccion,
      telefono,
      email,
      ciudadId,
      encargadoId,
      categoriaId,
    });

    await asignarTipoHabitaciones(nuevoHotel.id, tipoHabitaciones);

    // Obtener los tipos de habitaciones asignadas con su precio
    const tiposHabitacionesAsignadas = await getTiposHabitacionesHotel(
      nuevoHotel.id,
    );

    // Obtener el nombre del encargado
    const nombreEncargado = await getNombreEncargado(encargadoId);

    // Obtener los datos completos de la categoría
    const categoriaCompleta = await getCategoriaById(categoriaId);

    // Obtener la ciudad con su respectiva provincia y país
    const ciudadCompleta = await getCiudadCompleta(ciudadId);

    return {
      ...nuevoHotel.toJSON(),
      tipoHabitaciones: tiposHabitacionesAsignadas,
      nombreEncargado,
      categoriaCompleta,
      ciudadCompleta,
    };
  } catch (error) {
    await nuevoHotel.destroy();
    throw error;
  }
};

const modificarHotel = async (
  id,
  nombre,
  direccion,
  telefono,
  email,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarCiudad(ciudadId);

  await verificarHotel(
    nombre,
    ciudadId,
    direccion,
    email,
    telefono,
    encargadoId,
    categoriaId,
  );

  hotel.nombre = nombre;
  hotel.direccion = direccion;
  hotel.telefono = telefono;
  hotel.email = email;
  hotel.ciudadId = ciudadId;
  hotel.encargadoId = encargadoId;
  hotel.categoriaId = categoriaId;

  await hotel.save();
  return hotel;
};

//IMPLEMENTAR
const eliminarHotel = async (id) => {};

const asignarTipoHabitaciones = async (hotelId, tipoHabitaciones) => {
  // Verificar que los IDs de los tipos de habitación existan y no sean duplicados
  await verificarTiposHabitacion(tipoHabitaciones);

  for (const tipoHabitacion of tipoHabitaciones) {
    const { idTipoHabitacion, precio } = tipoHabitacion;

    // Crear la relación en la tabla intermedia
    await HotelTipoHabitacion.create({
      hotelId,
      tipoHabitacionId: idTipoHabitacion,
      precio,
    });
  }
};

// Obtener los tipos de habitaciones de un hotel
const getTiposHabitacionesHotel = async (idHotel) => {
  // Obtener los registros de la tabla intermedia
  const tiposHabitacionesAsignadas = await HotelTipoHabitacion.findAll({
    where: { hotelId: idHotel },
  });

  // Obtener los IDs de los tipos de habitación
  const idsTipoHabitacion = tiposHabitacionesAsignadas.map(
    (th) => th.tipoHabitacionId,
  );

  // Obtener los nombres de los tipos de habitación
  const tiposHabitacion = await TipoHabitacion.findAll({
    where: { id: idsTipoHabitacion },
    attributes: ['id', 'nombre'],
  });

  // Crear un mapa para acceder rápidamente a los nombres de los tipos de habitación
  const mapaTiposHabitacion = tiposHabitacion.reduce((mapa, tipo) => {
    mapa[tipo.id] = tipo.nombre;
    return mapa;
  }, {});

  // Combinar los datos y devolver el resultado
  return tiposHabitacionesAsignadas.map((th) => ({
    idTipoHabitacion: th.tipoHabitacionId,
    precio: th.precio,
    nombre: mapaTiposHabitacion[th.tipoHabitacionId],
  }));
};

const getNombreEncargado = async (encargadoId) => {
  const encargado = await Encargado.findByPk(encargadoId, {
    attributes: ['nombre', 'apellido'],
  });

  if (!encargado) {
    throw new CustomError('El encargado no existe', 404); // Not Found
  }

  return `${encargado.nombre} ${encargado.apellido}`;
};

const getCategoriaById = async (categoriaId) => {
  const categoria = await Categoria.findByPk(categoriaId);

  if (!categoria) {
    throw new CustomError('La categoría no existe', 404); // Not Found
  }

  return categoria;
};

const getCiudadCompleta = async (ciudadId) => {
  const ciudad = await Ciudad.findByPk(ciudadId, {
    include: [
      {
        model: Provincia,
        as: 'provincia',
        include: [
          {
            model: Pais,
            as: 'pais',
          },
        ],
      },
    ],
  });

  if (!ciudad) {
    throw new CustomError('La ciudad no existe', 404); // Not Found
  }

  return ciudad;
};

const getHotelesPorCiudad = async (ciudadId) => {
  // Obtener los hoteles de la ciudad especificada
  const hoteles = await Hotel.findAll({
    where: { ciudadId },
    include: [
      {
        model: Categoria,
        as: 'categoria',
      },
      {
        model: Ciudad,
        as: 'ciudad',
        include: [
          {
            model: Provincia,
            as: 'provincia',
            include: [
              {
                model: Pais,
                as: 'pais',
              },
            ],
          },
        ],
      },
    ],
  });

  return hoteles;
};

const obtenerCategorias = async () => {
  // Obtener todas las categorías de los hoteles
  const categorias = await Categoria.findAll();

  return categorias;
};

const verificarHotel = async (
  nombre,
  ciudadId,
  direccion,
  email,
  telefono,
  encargadoId,
  categoriaId,
) => {
  // Verificar si ya existe un hotel con el mismo nombre en la misma ciudad
  const hotelExistenteNombre = await Hotel.findOne({
    where: { nombre, ciudadId },
  });
  if (hotelExistenteNombre) {
    throw new CustomError(
      'Ya existe un hotel con el mismo nombre en esta ciudad',
      409,
    ); // Conflict
  }
  const encargadoExistente = await Encargado.findByPk(encargadoId);
  if (!encargadoExistente) {
    throw new CustomError('El encargado no existe', 404); // Not Found
  }
  const encargadoHotelExistente = await Hotel.findOne({
    where: { encargadoId },
  });
  if (encargadoHotelExistente) {
    throw new CustomError('El encargado ya tiene un hotel asignado', 409); // Conflict
  }
  const categoriaExistente = await Categoria.findByPk(categoriaId);
  if (!categoriaExistente) {
    throw new CustomError('La categoría no existe', 404); // Not Found
  }

  await verificarDireccion(direccion, ciudadId);
  await verificarEmail(email);
  await verificarTelefono(telefono);
};

//TERMINAR
const agregarPaquetePromocional = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);
  await verificarHabitacionesHotel(idHotel, paquete.habitaciones);
  await verificarFechas(paquete.fecha_inicio, paquete.fecha_fin);
  const habitacionesDiponibles =
    await verificarDisponibilidad.verificarDisponibilidadHabitaciones(
      paquete.habitaciones,
      paquete.fechaInicio,
      paquete.fechaFin,
    );
  if (habitacionesDiponibles) {
    throw new CustomError(
      'Algunas habitaciones no están disponibles en las fechas seleccionadas',
      400,
    );
  }
  const paqueteCreado = await paquetePromocionalServices.crearPaquete(
    idHotel,
    paquete,
  );

  // Crear la relación en la tabla intermedia
  const paqueteCompleto =
    await paquetePromocionalServices.asignarHabitacionAPaquete(
      paqueteCreado,
      paquete,
    );

  return paqueteCompleto;
  // return obtenerPaquetesPromocionales(idHotel);
};

const agregarTemporada = async (idHotel, temporada) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);
  // Verificar si las fechas son correctas
  await verificarFechas(temporada.fechaInicio, temporada.fechaFin);
  await temporadaServices.verificarTemporadas(
    idHotel,
    temporada.fechaInicio,
    temporada.fechaFin,
  );

  await verificarPorcentaje(temporada.porcentaje);

  // Crear la relación en la tabla intermedia
  const temporadaNueva = temporadaServices.crearTemporada(idHotel, temporada);

  return temporadaNueva;
};

const agregarDescuentos = async (idHotel, descuento) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);

  await verificarPorcentaje(descuento.porcentaje);
  // Verificar si las fechas son correctas
  await descuentoServices.verificarDescuentoExistente(idHotel, descuento);

  // Crear la relación en la tabla intermedia
  const descuentoNuevo = await descuentoServices.crearDescuento(
    idHotel,
    descuento,
  );

  return descuentoNuevo;
};

//Verifica si las habitaciones están disponibles para crear un paquete promocional
// const verificarAlquilada = async (habitaciones, fechaInicio, fechaFin) => {
//   for (const idHabitacion of habitaciones) {
//     const alquileres = await AlquilerHabitacion.findAll({
//       where: {
//         habitacionId: idHabitacion,
//         [Op.or]: [
//           {
//             fechaInicio: {
//               [Op.between]: [fechaInicio, fechaFin],
//             },
//           },
//           {
//             fechaFin: {
//               [Op.between]: [fechaInicio, fechaFin],
//             },
//           },
//           {
//             [Op.and]: [
//               {
//                 fechaInicio: {
//                   [Op.lte]: fechaInicio,
//                 },
//               },
//               {
//                 fechaFin: {
//                   [Op.gte]: fechaFin,
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     });

//     if (alquileres.length > 0) {
//       throw new CustomError(
//         `La habitación con ID ${idHabitacion} ya está alquilada en ese rango de fechas`,
//         409,
//       ); // Conflict
//     }
//   }
// };

/**
 * VERIFICAR QUE EXISTAN HOTELES EN LA CIUDAD
 * QUE TENGA HABITACIONES
 * QUE TENGA HABITACIONES DISPOBIBLES
 * BUSCAR PAQUETES QUE COINCIDAN CON LAS FECHAS
 */
const getDisponibilidadPorHotel = async (
  ubicacion,
  fechaInicio,
  fechaFin,
  pasajeros,
) => {
  const hotelesCiudad = await getHotelesPorCiudad(ubicacion);
  if (!hotelesCiudad) {
    throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
  }
  // Obtener los hoteles en la ubicación especificada

  if (hotelesCiudad.length === 0) {
    throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
  }

  const disponibilidad = [];

  for (const hotel of hotelesCiudad) {
    // Obtener la temporada actual del hotel
    const temporada = await temporadaServices.obtenerTemporadaActual(
      hotel.id,
      fechaInicio,
      fechaFin,
    );

    // Obtener las habitaciones disponibles agrupadas por tipo
    const habitaciones =
      await habitacionServices.obtenerHabitacionesDisponiblesPorTipo(
        hotel.id,
        fechaInicio,
        fechaFin,
        pasajeros,
      );

    // Obtener los paquetes turísticos disponibles
    const paquetes = await paquetePromocionalServices.obtenerPaquetesTuristicos(
      hotel.id,
      fechaInicio,
      fechaFin,
    );

    // Estructurar el objeto del hotel
    disponibilidad.push({
      hotelId: hotel.id,
      nombre: hotel.nombre,
      estrellas: hotel.categoria.nombre,
      descripcion: hotel.descripcion,
      temporada: temporada,
      ubicacion: {
        pais: hotel.ciudad.provincia.pais.nombre,
        provincia: hotel.ciudad.provincia.nombre,
        ciudad: hotel.ciudad.nombre,
      },
      habitaciones: habitaciones,
      paquetes: paquetes,
    });
  }

  return disponibilidad;
};

module.exports = {
  crearHotel,
  modificarHotel,
  obtenerCategorias,
  agregarPaquetePromocional,
  agregarTemporada,
  agregarDescuentos,
  getDisponibilidadPorHotel,
  //getHabitacionesDisponibles,
  //getPaquetesDisponibles,
};
