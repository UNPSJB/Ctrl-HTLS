const capitalize = (str) => {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const transformHotel = (hotel) => {
  if (!hotel) {
    return null;
  }
  if (hotel._isTransformed) {
    return null;
  }

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

  const paquetesAgrupados = (hotel.paquetes || []).reduce((acc, paquete) => {
    const grupoExistente = acc.find((g) => g.nombre === paquete.nombre);
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
        ...instanciaPaquete,
        instancias: [instanciaPaquete],
      });
    }
    return acc;
  }, []);

  return {
    ...hotel,
    nombre: capitalize(hotel.nombre),
    // --- ADAPTACIÓN PARA API REAL ---
    ubicacion: hotel.ciudad
      ? {
        nombrePais: capitalize(hotel.ciudad.provincia?.pais?.nombre || ''),
        nombreProvincia: capitalize(hotel.ciudad.provincia?.nombre || ''),
        nombreCiudad: capitalize(hotel.ciudad.nombre || ''),
      }
      : hotel.ubicacion
        ? {
          ...hotel.ubicacion,
          nombrePais: capitalize(
            hotel.ubicacion.nombrePais || hotel.ubicacion.pais
          ),
          nombreProvincia: capitalize(
            hotel.ubicacion.nombreProvincia || hotel.ubicacion.provincia
          ),
          nombreCiudad: capitalize(
            hotel.ubicacion.nombreCiudad || hotel.ubicacion.ciudad
          ),
        }
        : {},
    hotelId: Number(hotel.id || hotel.hotelId) || null,
    categoria: hotel.categoria
      ? {
        ...hotel.categoria,
        estrellas: hotel.categoria.estrellas || hotel.categoria.nombre,
      }
      : { estrellas: 0 },
    estrellas: hotel.categoria?.estrellas
      ? Number(hotel.categoria.estrellas)
      : !isNaN(hotel.categoria?.nombre)
        ? Number(hotel.categoria.nombre)
        : hotel.categoria?.nombre,
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
    paquetes: paquetesAgrupados,
    _isTransformed: true,
  };
};

export const transformHoteles = (hoteles) => {
  if (!Array.isArray(hoteles)) {
    return [];
  }
  return hoteles.map(transformHotel);
};
