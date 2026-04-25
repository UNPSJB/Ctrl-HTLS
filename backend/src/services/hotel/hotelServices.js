const { Op } = require('sequelize');
const Hotel = require('../../models/hotel/Hotel');
const HotelTipoHabitacion = require('../../models/hotel/HotelTipoHabitacion');
const TipoHabitacion = require('../../models/hotel/TipoHabitacion');
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
const Empleado = require('../../models/core/Empleado');
const paquetePromocionalServices = require('./paquetePromocionalServices');
const { verificarHabitacionesHotel } = require('./habitacionServices');
const temporadaServices = require('./temporadaServices');
const descuentoServices = require('./descuentoServices');
const habitacionServices = require('./habitacionServices');
const tipoHabitacionServices = require('./tipoHabitacionServices');
const hotelTipoHabitacionServices = require('./hotelTipoHabitacionServices');
const HotelEmpleado = require('../../models/hotel/HotelEmpleado');
const personaServices = require('../core/personaServices');
const Servicio = require('../../models/hotel/Servicio');
const Habitacion = require('../../models/hotel/Habitacion');

const crearHotel = async (
  nombre,
  direccion,
  telefono,
  email,
  descripcion,
  tipoHabitaciones,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  let nuevoHotel = {};

  try {
    await verificarCiudad(ciudadId);

    await verificarHotel(
      {
        nombre,
        ciudadId,
        direccion,
        email,
        telefono,
        encargadoId,
        categoriaId,
      },
      null,
    );
    // Crear el nuevo hotel
    nuevoHotel = await Hotel.create({
      nombre,
      direccion,
      telefono,
      email,
      descripcion,
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
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

const obtenerEncargados = async () => {
  try {
    return await Encargado.findAll({
      include: [
        {
          model: Hotel,
          as: 'hotel',
          attributes: ['id', 'nombre'],
        },
      ],
    });
  } catch (error) {
    throw new CustomError(
      `Error al obtener los encargados: ${error.message}`,
      500,
    );
  }
};

const modificarHotel = async (
  id,
  nombre,
  direccion,
  telefono,
  email,
  descripcion,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  // const hotel = await Hotel.findByPk(id);
  const hotel = await Hotel.findOne({
    where: { id: id, eliminado: false },
  });
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarCiudad(ciudadId);

  await verificarHotel(
    {
      nombre,
      ciudadId,
      direccion,
      email,
      telefono,
      encargadoId,
      categoriaId,
    },
    id,
  );

  hotel.nombre = nombre;
  hotel.direccion = direccion;
  hotel.telefono = telefono;
  hotel.email = email;
  hotel.descripcion = descripcion;
  hotel.ciudadId = ciudadId;
  hotel.encargadoId = encargadoId;
  hotel.categoriaId = categoriaId;

  await hotel.save();
  return hotel;
};

const eliminarHotel = async (id) => {
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }
  if (hotel.eliminado) {
    throw new CustomError('El hotel ya fue eliminado', 400);
  }

  await hotel.update({ eliminado: true, encargadoId: null });

  // Eliminar lógicamente todas las habitaciones del hotel
  await Habitacion.update(
    { eliminado: true },
    { where: { hotelId: id, eliminado: false } },
  );

  return hotel;
};

const reactivarHotel = async (id, encargadoId) => {
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404);
  }
  if (!hotel.eliminado) {
    throw new CustomError('El hotel no está eliminado', 400);
  }

  if (!encargadoId) {
    throw new CustomError(
      'Se requiere un encargado para reactivar el hotel',
      400,
    );
  }

  // Verificar que el encargado exista
  const encargado = await Encargado.findByPk(encargadoId);
  if (!encargado) {
    throw new CustomError('El encargado no existe', 404);
  }

  // Verificar que no exista otro hotel activo con el mismo nombre en la misma ciudad
  const hotelExistenteNombre = await Hotel.findOne({
    where: {
      nombre: hotel.nombre,
      ciudadId: hotel.ciudadId,
      eliminado: false,
      id: { [Op.ne]: id },
    },
  });
  if (hotelExistenteNombre) {
    throw new CustomError(
      'Ya existe un hotel activo con el mismo nombre en esta ciudad',
      409,
    );
  }

  // Verificar que el email no esté en uso por otro registro activo
  await verificarEmail(hotel.email, id);

  // Verificar que el teléfono no esté en uso por otro registro activo
  await verificarTelefono(hotel.telefono, id);

  // Verificar que la dirección no esté en uso por otro registro activo
  await verificarDireccion(hotel.direccion, hotel.ciudadId, id);

  // Verificar que el encargado no esté asignado a otro hotel activo
  const encargadoHotelExistente = await Hotel.findOne({
    where: {
      encargadoId,
      eliminado: false,
      id: { [Op.ne]: id },
    },
  });
  if (encargadoHotelExistente) {
    throw new CustomError(
      'El encargado ya tiene un hotel activo asignado',
      409,
    );
  }

  await hotel.update({ eliminado: false, encargadoId });

  // Reactivar todas las habitaciones del hotel
  await Habitacion.update(
    { eliminado: false },
    { where: { hotelId: id, eliminado: true } },
  );

  return hotel;
};

const getHotelById = async (hotelId) => {
  const hotel = await Hotel.findOne({
    where: { id: hotelId },
    include: [
      {
        model: Encargado,
        as: 'encargado',
        attributes: [
          'id',
          'nombre',
          'apellido',
          'tipoDocumento',
          'dni',
          'telefono',
        ],
      },
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
      {
        model: HotelTipoHabitacion,
        as: 'hotelTipoHabitaciones',
        attributes: ['hotelId', 'tipoHabitacionId', 'precio'],
        include: [
          {
            model: TipoHabitacion,
            as: 'tipoHabitacion',
            attributes: ['id', 'nombre', 'capacidad'],
          },
        ],
      },
      {
        model: Empleado,
        as: 'empleados',
        attributes: [
          'id',
          'nombre',
          'apellido',
          'email',
          'tipoDocumento',
          'numeroDocumento',
        ],
      },
    ],
  });

  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  const hotelData = hotel.toJSON();
  const { empleados, ...restHotelData } = hotelData;
  const ciudad = hotelData.ciudad;
  const provincia = ciudad?.provincia;
  const pais = provincia?.pais;

  return {
    ...restHotelData,
    encargado: hotelData.encargado
      ? {
          id: hotelData.encargado.id,
          nombre: hotelData.encargado.nombre,
          apellido: hotelData.encargado.apellido,
          tipoDocumento: hotelData.encargado.tipoDocumento,
          numeroDocumento: hotelData.encargado.dni,
          telefono: hotelData.encargado.telefono,
        }
      : null,
    ubicacion: ciudad
      ? {
          ciudadId: ciudad.id,
          provinciaId: provincia?.id,
          paisId: pais?.id,
          ciudad: ciudad,
          provincia: provincia,
          pais: pais,
        }
      : null,
    tarifas: hotelData.hotelTipoHabitaciones?.map((registro) => ({
      hotelId: registro.hotelId,
      tipoHabitacionId: registro.tipoHabitacionId,
      tipoHabitacionNombre: registro.tipoHabitacion?.nombre,
      capacidad: registro.tipoHabitacion?.capacidad,
      precio: registro.precio,
    })),
    vendedores: hotelData.empleados?.map((emp) => ({
      empleadoId: emp.id,
      empleadoNombre: emp.nombre,
      empleadoApellido: emp.apellido,
      empleadoEmail: emp.email,
      empleadoTipoDocumento: emp.tipoDocumento,
      empleadoNumeroDocumento: emp.numeroDocumento,
    })),
  };
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
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

// Obtener los tipos de habitaciones de un hotel
const getTiposHabitacionesHotel = async (idHotel) => {
  // Obtener los registros de la tabla intermedia
  try {
    return hotelTipoHabitacionServices.getTipoHabitacionesDeHotel(idHotel);
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

const obtenerTarifasDeHotel = async (hotelId) => {
  await verificarIdHotel(hotelId);

  const tiposHabitacion = await TipoHabitacion.findAll({
    attributes: ['id', 'nombre', 'capacidad'],
    raw: true,
  });

  const tarifasHotel = await HotelTipoHabitacion.findAll({
    where: { hotelId },
    attributes: ['tipoHabitacionId', 'precio'],
    raw: true,
  });

  const mapaTarifas = tarifasHotel.reduce((acc, tarifa) => {
    acc[tarifa.tipoHabitacionId] = tarifa.precio;
    return acc;
  }, {});

  return tiposHabitacion.map((tipo) => ({
    id: tipo.id,
    nombre: tipo.nombre,
    capacidad: tipo.capacidad,
    precio: mapaTarifas[tipo.id] ?? 0,
  }));
};

const actualizarTarifasDeHotel = async (hotelId, tarifas) => {
  await verificarIdHotel(hotelId);

  if (!Array.isArray(tarifas)) {
    throw new CustomError('El campo "tarifas" debe ser un arreglo', 400);
  }

  const transaction = await sequelize.transaction();
  try {
    for (const tarifa of tarifas) {
      const { tipoHabitacionId, precio } = tarifa;

      if (!tipoHabitacionId || precio === undefined) {
        throw new CustomError(
          'Cada tarifa debe incluir "tipoHabitacionId" y "precio"',
          400,
        );
      }

      const precioNumerico = Number(precio);
      if (Number.isNaN(precioNumerico) || precioNumerico < 0) {
        throw new CustomError(
          'El "precio" debe ser un número mayor o igual a 0',
          400,
        );
      }

      const tipoHabitacion = await TipoHabitacion.findByPk(tipoHabitacionId, {
        transaction,
      });

      if (!tipoHabitacion) {
        throw new CustomError(
          `El tipo de habitación con ID ${tipoHabitacionId} no existe`,
          404,
        );
      }

      const [registro, creado] = await HotelTipoHabitacion.findOrCreate({
        where: { hotelId, tipoHabitacionId },
        defaults: { precio: precioNumerico },
        transaction,
      });

      if (!creado) {
        registro.precio = precioNumerico;
        await registro.save({ transaction });
      }
    }

    await transaction.commit();
    return obtenerTarifasDeHotel(hotelId);
  } catch (error) {
    await transaction.rollback();
    throw new CustomError(error.message, error.statusCode || 500);
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
    where: { ciudadId, eliminado: false },
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

const obtenerTodosLosHoteles = async () => {
  const hoteles = await Hotel.findAll({
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
      {
        model: Encargado,
        as: 'encargado',
        attributes: ['id', 'nombre', 'apellido'],
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

const verificarHotel = async (hotelData, hotelId = null) => {
  const {
    nombre,
    ciudadId,
    direccion,
    email,
    telefono,
    encargadoId,
    categoriaId,
  } = hotelData;
  // Verificar si ya existe un hotel con el mismo nombre en la misma ciudad
  const hotelExistenteNombre = await Hotel.findOne({
    where: {
      nombre,
      ciudadId,
      eliminado: false,
      ...(hotelId && { id: { [Op.ne]: hotelId } }),
    },
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
    where: {
      encargadoId,
      eliminado: false,
      ...(hotelId && { id: { [Op.ne]: hotelId } }),
    },
  });
  if (encargadoHotelExistente) {
    throw new CustomError('El encargado ya tiene un hotel asignado', 409); // Conflict
  }
  const categoriaExistente = await Categoria.findByPk(categoriaId);
  if (!categoriaExistente) {
    throw new CustomError('La categoría no existe', 404); // Not Found
  }

  await verificarDireccion(direccion, ciudadId, hotelId);
  await verificarEmail(email, hotelId);
  await verificarTelefono(telefono, hotelId);
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

const eliminarPaqueteDeHotel = async (idHotel, idPaquete) => {
  await verificarIdHotel(idHotel);
  return paquetePromocionalServices.eliminarPaquete(idHotel, idPaquete);
};

const actualizarPaqueteDeHotel = async (idHotel, idPaquete, datosPaquete) => {
  await verificarIdHotel(idHotel);

  // Verificar fechas si se enviaron
  if (datosPaquete.fecha_inicio && datosPaquete.fecha_fin) {
    await verificarFechas(datosPaquete.fecha_inicio, datosPaquete.fecha_fin);
  }

  // Verificar que las habitaciones pertenecen al hotel si se enviaron
  if (datosPaquete.habitaciones && datosPaquete.habitaciones.length > 0) {
    await verificarHabitacionesHotel(idHotel, datosPaquete.habitaciones);
  }

  return paquetePromocionalServices.actualizarPaquete(
    idHotel,
    idPaquete,
    datosPaquete,
  );
};

const obtenerPaquetesDeHotel = async (idHotel) => {
  await verificarIdHotel(idHotel);
  const paquetes =
    await paquetePromocionalServices.obtenerPaquetesPorHotel(idHotel);
  return paquetes;
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

const obtenerTemporadasDeHotel = async (hotelId) => {
  await verificarIdHotel(hotelId);
  return temporadaServices.obtenerTemporadasPorHotel(hotelId);
};

const eliminarTemporadaDeHotel = async (hotelId, temporadaId) => {
  await verificarIdHotel(hotelId);
  return temporadaServices.eliminarTemporada(hotelId, temporadaId);
};

const actualizarTemporadaDeHotel = async (
  hotelId,
  temporadaId,
  datosTemporada,
) => {
  await verificarIdHotel(hotelId);

  if (datosTemporada.fechaInicio && datosTemporada.fechaFin) {
    await verificarFechas(datosTemporada.fechaInicio, datosTemporada.fechaFin);
  }

  if (datosTemporada.porcentaje !== undefined) {
    await verificarPorcentaje(datosTemporada.porcentaje);
  }

  return temporadaServices.actualizarTemporada(
    hotelId,
    temporadaId,
    datosTemporada,
  );
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

const eliminarDescuentoDeHotel = async (hotelId, descuentoId) => {
  await verificarIdHotel(hotelId);
  return descuentoServices.eliminarDescuento(hotelId, descuentoId);
};

/**
 * VERIFICAR QUE EXISTAN HOTELES EN LA CIUDAD
 * QUE TENGA HABITACIONES
 * QUE TENGA HABITACIONES DISPOBIBLES
 * BUSCAR PAQUETES QUE COINCIDAN CON LAS FECHAS
 */

/**
 * Funcion que obtiene la disponibilidad de hoteles en una ubicación específica
 *
 * @param {*} ubicacion - ID de la ciudad
 * @param {*} fechaInicio - Fecha de inicio de alquiler en formato ISO (YYYY-MM-DD)
 * @param {*} fechaFin - Fecha de fin de alquiler en formato ISO (YYYY-MM-DD)
 * @param {*} pasajeros - Cantidad de pasajeros
 * @param {*} nombreHotel - Nombre del hotel (opcional, puede ser 'null')
 * @param {*} vendedorId - ID del vendedor que realiza la consulta
 * @returns - Arreglo de hoteles con su disponibilidad, habitaciones y paquetes
 */
const getDisponibilidadPorHotel = async (
  ubicacion,
  fechaInicio,
  fechaFin,
  pasajeros,
  nombreHotel,
  vendedorId,
) => {
  const disponibilidad = [];

  if (nombreHotel !== 'null') {
    console.log(nombreHotel.length);

    const hotel = await verificarHotelUbicacion(nombreHotel, ubicacion);
    if (!hotel) {
      throw new CustomError(
        `No se encontró el hotel ${nombreHotel} en la ciudad especificada`,
        404,
      ); // Not Found
    }

    const hotelVendedor = await verificarHotelVendedor(hotel.id, vendedorId);
    if (!hotelVendedor) {
      throw new CustomError(
        `El vendedor no está asociado al hotel ${nombreHotel}`,
        403,
      ); // Forbidden
    }

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

    // No incluir hoteles que no tienen habitaciones ni paquetes disponibles
    if (habitaciones.length === 0 && paquetes.length === 0) {
      throw new CustomError(
        `El hotel ${nombreHotel} no tiene habitaciones ni paquetes disponibles en las fechas seleccionadas`,
        404,
      );
    }

    // Estructurar el objeto del hotel
    disponibilidad.push({
      hotelId: hotel.id,
      nombre: hotel.nombre,
      categoria: {
        estrellas: hotel.categoria.nombre,
        servicios: hotel.categoria.servicios.map((servicio) => servicio.nombre),
      },
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
  } else {
    const hotelesCiudad = await getHotelesPorCiudadYVendedor(
      ubicacion,
      vendedorId,
    );

    console.log(hotelesCiudad[0].categoria);

    if (!hotelesCiudad) {
      throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
    }
    // Obtener los hoteles en la ubicación especificada

    if (hotelesCiudad.length === 0) {
      throw new CustomError('No hay hoteles en la ciudad especificada', 404); // Not Found
    }
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
      const paquetes =
        await paquetePromocionalServices.obtenerPaquetesTuristicos(
          hotel.id,
          fechaInicio,
          fechaFin,
        );

      // No incluir hoteles que no tienen habitaciones ni paquetes disponibles
      if (habitaciones.length === 0 && paquetes.length === 0) {
        continue;
      }

      // Estructurar el objeto del hotel
      disponibilidad.push({
        hotelId: hotel.id,
        nombre: hotel.nombre,
        categoria: {
          estrellas: hotel.categoria.nombre,
          servicios: hotel.categoria.servicios.map(
            (servicio) => servicio.nombre,
          ),
        },
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

    if (disponibilidad.length === 0) {
      throw new CustomError(
        'No hay hoteles con disponibilidad en la ciudad especificada para las fechas seleccionadas',
        404,
      );
    }
  }
  return disponibilidad;
};

const getDisponibilidadPorHotelId = async (
  hotelId,
  fechaInicio,
  fechaFin,
  pasajeros,
) => {
  const pasajerosNum = pasajeros || Number.MAX_SAFE_INTEGER;
  const hotel = await Hotel.findOne({
    where: { id: hotelId, eliminado: false },
    include: [
      {
        model: Categoria,
        as: 'categoria',
        include: [
          {
            model: Servicio,
            as: 'servicios',
            through: { attributes: [] },
          },
        ],
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

  if (!hotel) {
    throw new CustomError('El hotel no existe', 404);
  }

  const habitaciones =
    await habitacionServices.obtenerHabitacionesDisponiblesPorTipo(
      hotel.id,
      fechaInicio,
      fechaFin,
      pasajerosNum,
    );

  const paquetes = await paquetePromocionalServices.obtenerPaquetesTuristicos(
    hotel.id,
    fechaInicio,
    fechaFin,
  );

  if (habitaciones.length === 0 && paquetes.length === 0) {
    throw new CustomError(
      'El hotel no tiene habitaciones ni paquetes disponibles en las fechas seleccionadas',
      404,
    );
  }

  return { habitaciones, paquetes };
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
  telefono,
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
      telefono,
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

    const hotelAsignado = await Hotel.findOne({ where: { encargadoId: id } });

    if (hotelAsignado) {
      await hotelAsignado.update({ encargadoId: null });
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

const obtenerEncargadoPorId = async (id) => {
  const encargado = await Encargado.findByPk(id, {
    include: [
      {
        model: Hotel,
        as: 'hotel',
        attributes: ['id', 'nombre'],
      },
    ],
  });

  if (!encargado) {
    throw new CustomError('Encargado no encontrado', 404);
  }

  return encargado;
};

const actualizarEncargado = async (id, datosEncargado) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento, telefono } =
    datosEncargado;

  const encargado = await Encargado.findByPk(id);
  if (!encargado) {
    throw new CustomError('Encargado no encontrado', 404);
  }

  // Verificar documento solo si cambió
  if (numeroDocumento && numeroDocumento !== encargado.dni) {
    await verificarDocumento(numeroDocumento);
  }

  if (tipoDocumento) {
    await verificarTipoDocumento(tipoDocumento);
  }

  // Verificar teléfono solo si viene con valor y cambió
  if (telefono && telefono.trim() !== '' && telefono !== encargado.telefono) {
    await verificarTelefono(telefono);
  }

  await encargado.update({
    nombre: nombre || encargado.nombre,
    apellido: apellido || encargado.apellido,
    tipoDocumento: tipoDocumento || encargado.tipoDocumento,
    dni: numeroDocumento || encargado.dni,
    telefono: telefono !== undefined ? telefono : encargado.telefono,
  });

  return encargado;
};

/**
 * Verifica si un hotel con el nombre dado existe en la ciudad especificada
 * @param {*} nombreHotel - Nombre del hotel a verificar
 * @param {*} ciudadId - ID de la ciudad donde buscar el hotel
 * @returns {Object|null} - Retorna el hotel si existe, de lo contrario null
 */
const verificarHotelUbicacion = async (nombreHotel, ciudadId) => {
  try {
    const hotel = await Hotel.findOne({
      where: {
        nombre: { [Op.iLike]: `%${nombreHotel}%` },
        ciudadId: ciudadId,
        eliminado: false,
      },
      include: [
        {
          model: Categoria,
          as: 'categoria',
          include: [
            {
              model: Servicio,
              as: 'servicios', // Usar el alias de la relación many-to-many
              through: { attributes: [] }, // No incluir atributos de la tabla intermedia
            },
          ],
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
    return hotel || null;
  } catch (error) {
    throw new CustomError(
      `Error al verificar el hotel en la ubicación: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

/**
 * Verifica si un vendedor está asociado a un hotel específico
 *
 * @param {*} hotelId - ID del hotel
 * @param {*} vendedorId - ID del vendedor
 * @returns {Object|null} - Retorna el registro de HotelEmpleado si existe, de lo contrario null
 */
const verificarHotelVendedor = async (hotelId, vendedorId) => {
  try {
    const hotelVendedor = await HotelEmpleado.findOne({
      where: { hotelId, empleadoId: vendedorId },
    });
    return hotelVendedor || null;
  } catch (error) {
    throw new CustomError(
      `Error al verificar el hotel y vendedor: ${error.message}`,
      500,
    ); // Internal Server Error
  }
};

/**
 * Función para obtener hoteles en una ciudad donde trabaja un vendedor específico
 *
 * @param {*} ciudadId - ID de la ciudad
 * @param {*} vendedorId - ID del vendedor
 * @returns - Arreglo de hoteles en la ciudad donde trabaja el vendedor
 */

const getHotelesPorCiudadYVendedor = async (ciudadId, vendedorId) => {
  // Obtener IDs de hoteles donde trabaja el vendedor
  const hotelEmpleados = await HotelEmpleado.findAll({
    where: { empleadoId: vendedorId },
    attributes: ['hotelId'],
  });

  const hotelesIds = hotelEmpleados.map((he) => he.hotelId);

  if (hotelesIds.length === 0) {
    throw new CustomError(
      'El vendedor no está asociado a ningún hotel en la ciudad especificada',
      403,
    ); // Forbidden
  }

  // Obtener hoteles de la ciudad que están en esa lista
  const hoteles = await Hotel.findAll({
    where: {
      ciudadId,
      id: hotelesIds,
      eliminado: false,
    },
    include: [
      {
        model: Categoria,
        as: 'categoria',
        include: [
          {
            model: Servicio,
            as: 'servicios', // Usar el alias de la relación many-to-many
            through: { attributes: [] }, // No incluir atributos de la tabla intermedia
          },
        ],
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

// const getHotelesPorCiudadYVendedor = async (ciudadId, vendedorId) => {
//   // Obtener IDs de hoteles donde trabaja el vendedor
//   const hotelEmpleados = await HotelEmpleado.findAll({
//     where: { empleadoId: vendedorId },
//     attributes: ['hotelId'],
//   });

//   const hotelesIds = hotelEmpleados.map((he) => he.hotelId);

//   if (hotelesIds.length === 0) {
//     throw new CustomError(
//       'El vendedor no está asociado a ningún hotel en la ciudad especificada',
//       403,
//     ); // Forbidden
//   }

//   // Obtener hoteles de la ciudad que están en esa lista
//   const hoteles = await Hotel.findAll({
//     where: {
//       ciudadId,
//       id: hotelesIds,
//     },
//     include: [
//       {
//         model: Categoria,
//         as: 'categoria',
//       },
//       {
//         model: Ciudad,
//         as: 'ciudad',
//         include: [
//           {
//             model: Provincia,
//             as: 'provincia',
//             include: [
//               {
//                 model: Pais,
//                 as: 'pais',
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   });

//   return hoteles;
// };

/**
 * Función para asignar un empleado a un hotel
 *
 * @param {*} hotelId - ID del hotel
 * @param {*} empleadoId  - ID del empleado (vendedor)
 * @returns - Objeto de la asignación creada
 */
const asignarEmpleadoAHotel = async (hotelId, empleadoId) => {
  try {
    // Verificar si el hotel existe
    await verificarIdHotel(hotelId);

    //Verificar si el empleado existe
    await personaServices.obtenerVendedorPorId(empleadoId);
    // Verificar si el empleado ya está asignado al hotel
    const asignacionExistente = await HotelEmpleado.findOne({
      where: { hotelId, empleadoId },
    });
    if (asignacionExistente) {
      throw new CustomError('El empleado ya está asignado a este hotel', 409); // Conflict
    }
    // Crear la asignación
    const nuevaAsignacion = await HotelEmpleado.create({
      hotelId,
      empleadoId,
    });
    return nuevaAsignacion;
  } catch (error) {
    throw new CustomError(
      `Error al asignar el empleado al hotel: ${error.message}`,
      error.statusCode || 500,
    ); // Internal Server Error
  }
};

/**
 * Función para desasignar un empleado de un hotel
 *
 * @param {*} hotelId - ID del hotel
 * @param {*} empleadoId  - ID del empleado (vendedor)
 */
const desasignarEmpleadoDeHotel = async (hotelId, empleadoId) => {
  try {
    await verificarIdHotel(hotelId);
    await personaServices.obtenerVendedorPorId(empleadoId);

    const asignacion = await HotelEmpleado.findOne({
      where: { hotelId, empleadoId },
    });

    if (!asignacion) {
      throw new CustomError('El empleado no está asignado a este hotel', 404); // Not Found
    }

    await asignacion.destroy();
    return { message: 'Empleado desasignado correctamente del hotel' };
  } catch (error) {
    throw new CustomError(
      `Error al desasignar el empleado del hotel: ${error.message}`,
      error.statusCode || 500,
    );
  }
};

module.exports = {
  crearHotel,
  modificarHotel,
  eliminarHotel,
  reactivarHotel,
  getHotelById,
  obtenerTodosLosHoteles,
  obtenerCategorias,
  agregarPaquetePromocional,
  eliminarPaqueteDeHotel,
  actualizarPaqueteDeHotel,
  obtenerPaquetesDeHotel,
  agregarTemporada,
  obtenerTemporadasDeHotel,
  eliminarTemporadaDeHotel,
  actualizarTemporadaDeHotel,
  agregarDescuentos,
  getDescuentosDeHotel,
  eliminarDescuentoDeHotel,
  getDisponibilidadPorHotel,
  getHotelesPorCiudad,
  obtenerTiposDeHabitacion,
  //getHabitacionesDisponibles,
  //getPaquetesDisponibles,
  crearEncargado,
  deleteEncargado,
  obtenerEncargadoPorId,
  actualizarEncargado,
  asignarEmpleadoAHotel,
  desasignarEmpleadoDeHotel,
  obtenerEncargados,
  obtenerTarifasDeHotel,
  actualizarTarifasDeHotel,
  getDisponibilidadPorHotelId,
};
