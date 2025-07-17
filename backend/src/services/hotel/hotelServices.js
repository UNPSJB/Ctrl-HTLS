const Hotel = require('../../models/hotel/Hotel');
const sequelize = require('../../config/database');
const {
  verificarCiudad,
  verificarDireccion,
  verificarEmail,
  verificarTelefono,
  verificarTipoDocumento,
  verificarIdHotel,
  verificarFechas,
  verificarPorcentaje,
  verificarDocumento,
} = require('../../utils/helpers');
const CustomError = require('../../utils/CustomError');
const Categoria = require('../../models/hotel/Categoria');
const Encargado = require('../../models/hotel/Encargado');
const Ciudad = require('../../models/core/Ciudad');
const Provincia = require('../../models/core/Provincia');
const Pais = require('../../models/core/Pais');
const Descuento = require('../../models/hotel/Descuento');
const paquetePromocionalServices = require('./paquetePromocionalServices');
const { verificarHabitacionesHotel } = require('./habitacionServices');
const temporadaServices = require('./temporadaServices');
const descuentoServices = require('./descuentoServices');
const habitacionServices = require('./habitacionServices');
const tipoHabitacionServices = require('./tipoHabitacionServices');
const hotelTipoHabitacionServices = require('./hotelTipoHabitacionServices');

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
  let nuevoHotel = {};

  try {
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
    await deleteEncargado(encargadoId);
    throw new CustomError(error.message, error.status || 500);
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
const eliminarHotel = async (id) => {
  return id;
};

const asignarTipoHabitaciones = async (hotelId, tipoHabitaciones) => {
  const transaction = await sequelize.transaction(); // Iniciamos transacción manual
  try {
    const hotel = await Hotel.findByPk(hotelId, { transaction });
    if (!hotel) {
      throw new CustomError('El hotel no existe', 404); // Not Found
    }

    const tiposHabitacionAsignados = [];

    for (const tipoHabitacion of tipoHabitaciones) {
      // Verificamos si el tipo de habitación existe
      const tipo = await tipoHabitacionServices.getTipoHabitacion(
        tipoHabitacion.id,
      );
      if (!tipo) {
        throw new CustomError(
          `Tipo de habitación con ID ${tipoHabitacion.id} no existe`,
          400,
        );
      }

      // Verificamos si ya está asociado
      const yaAsociado =
        await hotelTipoHabitacionServices.getTipoHabitacionDeHotel(
          hotelId,
          tipoHabitacion.id,
        );
      if (yaAsociado) {
        throw new CustomError(
          `El tipo de habitación con ID ${tipoHabitacion.id} ya está asignado al hotel`,
          409, // Conflict
        );
      }

      // Asociamos dentro de la transacción
      await hotelTipoHabitacionServices.asociarTipoHabitacionAHotel(
        hotelId,
        tipoHabitacion.id,
        tipoHabitacion.precio,
        transaction,
      );

      tiposHabitacionAsignados.push(tipo);
    }

    await transaction.commit(); // Todo salió bien, confirmamos los cambios
    return tiposHabitacionAsignados;
  } catch (error) {
    await transaction.rollback(); // Algo falló, deshacemos todo
    throw new CustomError(error.message, error.status || 500);
  }
};

// Obtener los tipos de habitaciones de un hotel
const getTiposHabitacionesHotel = async (idHotel) => {
  // Obtener los registros de la tabla intermedia
  try {
    return hotelTipoHabitacionServices.getTipoHabitacionesDeHotel(idHotel);
  } catch (error) {
    throw new CustomError(error.message, error.status || 500);
  }
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

  console.log('ENCARGADO ID:', encargadoId);

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

const agregarPaquetePromocional = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  await verificarIdHotel(idHotel);
  // Verifica si las habitaciones pertenecen al hotel
  await verificarHabitacionesHotel(idHotel, paquete.habitaciones);
  // Verificar si la fecha inicio es menor a la fecha fin
  await verificarFechas(paquete.fecha_inicio, paquete.fecha_fin);

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

const getDescuentosDeHotel = async (hotelId) => {
  try {
    const descuentos = await Descuento.findAll({
      where: { hotelId },
      attributes: ['id', 'porcentaje', 'cantidad_de_habitaciones'], // Seleccionar solo los campos necesarios
    });

    return descuentos;
  } catch (error) {
    throw new Error(
      `Error al obtener los descuentos del hotel: ${error.message}`,
    );
  }
};

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

    const descuentos = await getDescuentosDeHotel(hotel.id);

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
      descuentos: descuentos,
      direccion: hotel.direccion,
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

const obtenerTiposDeHabitacion = async () => {
  // Obtener todos los tipos de habitaciones
  try {
    const tiposDeHabitacion =
      await tipoHabitacionServices.getTiposDeHabitacion();
    return tiposDeHabitacion;
  } catch (error) {
    throw new CustomError(
      `Error al obtener los tipos de habitación: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

const crearEncargado = async (
  nombre,
  apellido,
  tipoDocumento,
  numeroDocumento,
) => {
  let nuevoEncargado = {};
  try {
    await verificarDocumento(numeroDocumento);
    await verificarTipoDocumento(tipoDocumento);
    nuevoEncargado = await Encargado.create({
      nombre,
      apellido,
      dni: numeroDocumento,
      tipoDocumento,
    });

    return nuevoEncargado.dataValues;
  } catch (error) {
    throw new CustomError(`Error al crear el encargado: ${error.message}`, 500); // Internal Server Error
  }
};

const deleteEncargado = async (id) => {
  try {
    const encargado = await Encargado.findByPk(id);

    if (!encargado) {
      throw new CustomError(`Encargado no encontrado con id ${id}`, 404); // Not Found
    }

    await encargado.destroy();

    return { message: `Encargado con id ${id} eliminado correctamente` };
  } catch (error) {
    throw new CustomError(
      `Error al eliminar el encargado: ${error.message}`,
      500,
    );
  }
};

module.exports = {
  crearHotel,
  modificarHotel,
  obtenerCategorias,
  agregarPaquetePromocional,
  agregarTemporada,
  agregarDescuentos,
  getDisponibilidadPorHotel,
  obtenerTiposDeHabitacion,
  eliminarHotel,
  //getHabitacionesDisponibles,
  //getPaquetesDisponibles,
  crearEncargado,
};
