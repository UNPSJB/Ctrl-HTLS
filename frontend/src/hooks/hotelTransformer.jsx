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
    // --- CORRECCIÓN AQUÍ: Verificación de seguridad ---
    ubicacion: hotel.ubicacion
      ? {
          ...hotel.ubicacion,
          // Usamos el nombre que viene de la API o el que ya tiene el objeto
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
    hotelId: Number(hotel.hotelId) || null,
    estrellas: hotel.categoria?.estrellas
      ? Number(hotel.categoria.estrellas)
      : hotel.categoria?.estrellas,
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
