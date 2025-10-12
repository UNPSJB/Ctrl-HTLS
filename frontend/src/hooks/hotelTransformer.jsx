/**
 * Transforma un objeto hotel del formato de backend a una estructura optimizada para el frontend.
 * Realiza dos tareas principales:
 * 1. Coerción de tipos: Convierte strings a Numbers.
 * 2. Reestructuración de datos: Simplifica la estructura del array de habitaciones para un consumo más fácil en la UI.
 *
 * Esta función es idempotente: si se le pasa un hotel ya transformado, no lo volverá a transformar.
 *
 * @param {Object} hotel - Objeto hotel crudo.
 * @returns {Object|null} - Objeto hotel transformado.
 */
export const transformHotel = (hotel) => {
  if (!hotel) {
    return null;
  }

  // Comprueba si la transformación ya se aplicó buscando la propiedad 'tipo'.
  const isAlreadyTransformed =
    hotel.habitaciones?.[0] && Object.hasOwn(hotel.habitaciones[0], 'tipo');

  const habitacionesTransformadas = isAlreadyTransformed
    ? hotel.habitaciones
    : (hotel.habitaciones || []).map((group) => {
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
    descuentos: (hotel.descuentos || []).map((descuento) => ({
      ...descuento,
      id: Number(descuento.id),
      porcentaje: Number(descuento.porcentaje) || 0,
      cantidad_de_habitaciones: Number(descuento.cantidad_de_habitaciones) || 0,
    })),
    habitaciones: habitacionesTransformadas,
    paquetes: (hotel.paquetes || []).map((paquete) => ({
      ...paquete,
      id: Number(paquete.id),
      noches: Number(paquete.noches) || 0,
      descuento: Number(paquete.descuento) || 0,
      habitaciones: (paquete.habitaciones || []).map((hab) => ({
        ...hab,
        capacidad: Number(hab.capacidad) || 0,
        precio: Number(hab.precio) || 0,
      })),
    })),
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
