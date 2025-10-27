/**
 * Transforma un objeto hotel del formato de backend a una estructura optimizada para el frontend.
 * - Coerción de tipos: Convierte strings a Numbers.
 * - Reestructuración de datos: Agrupa habitaciones y paquetes por tipo/nombre.
 *
 * @param {Object} hotel - Objeto hotel crudo.
 * @returns {Object|null} - Objeto hotel transformado.
 */
export const transformHotel = (hotel) => {
  if (!hotel) {
    return null;
  }

  // Si el hotel ya fue transformado, lo retornamos para evitar trabajo doble.
  if (hotel._isTransformed) {
    return hotel;
  }

  // 1. Transformar y agrupar habitaciones
  const habitacionesTransformadas = (hotel.habitaciones || []).map((group) => {
    const tipoHabitacion = Object.keys(group).find((key) =>
      Array.isArray(group[key])
    );
    return {
      tipo: tipoHabitacion,
      habitaciones: group[tipoHabitacion] || [],
      precio: Number(group.precio) || 0,
      capacidad: Number(group.capacidad) || 0,
    };
  });

  // 2. Transformar y agrupar paquetes
  const paquetesAgrupados = (hotel.paquetes || []).reduce((acc, paquete) => {
    const grupoExistente = acc.find((g) => g.nombre === paquete.nombre);

    // Transformar la instancia actual del paquete
    const instanciaPaquete = {
      ...paquete,
      id: Number(paquete.id),
      noches: Number(paquete.noches) || 0,
      descuento: Number(paquete.descuento) || 0,
      habitaciones: (paquete.habitaciones || []).map((hab) => ({
        ...hab,
        capacidad: Number(hab.capacidad) || 0,
        precio: Number(hab.precio) || 0,
      })),
    };

    if (grupoExistente) {
      grupoExistente.instancias.push(instanciaPaquete);
    } else {
      acc.push({
        ...instanciaPaquete, // Usamos la primera instancia como base
        instancias: [instanciaPaquete], // Creamos el array de instancias
      });
    }
    return acc;
  }, []);

  return {
    ...hotel,
    hotelId: Number(hotel.hotelId) || null,
    estrellas: Number(hotel.estrellas) || 0,
    temporada: hotel.temporada
      ? {
          ...hotel.temporada,
          porcentaje: Number(hotel.temporada.porcentaje) || 0,
        }
      : null,
    descuentos: (hotel.descuentos || []).map((d) => ({
      ...d,
      porcentaje: Number(d.porcentaje) || 0,
      cantidad_de_habitaciones: Number(d.cantidad_de_habitaciones) || 0,
    })),
    habitaciones: habitacionesTransformadas,
    paquetes: paquetesAgrupados, // Usamos los paquetes ya agrupados
    _isTransformed: true, // Bandera para evitar re-transformación
  };
};

/**
 * Transforma un array de hoteles.
 * @param {Array<Object>} hoteles - Array de objetos hotel crudos.
 * @returns {Array<Object>} - Array de hoteles transformados.
 */
export const transformHoteles = (hoteles) => {
  if (!Array.isArray(hoteles)) {
    return [];
  }
  return hoteles.map(transformHotel);
};
