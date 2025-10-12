/**
 * Transforma un objeto hotel del formato de backend (crudo) al formato optimizado para el frontend.
 *
 * El único objetivo de esta función es la coerción de tipos: asegurarse de que
 * todos los valores que deben ser numéricos (precios, porcentajes, IDs, etc.)
 * se conviertan de string a Number.
 *
 * Mantiene la estructura original del objeto recibido.
 *
 * @param {Object} hotel - Objeto hotel crudo desde la API.
 * @returns {Object|null} - Objeto hotel transformado con los tipos de datos numéricos correctos.
 */
export const transformHotel = (hotel) => {
  if (!hotel) {
    return null;
  }

  // Se devuelve el hotel original, pero sobreescribiendo las propiedades
  // que necesitan ser convertidas a números.
  return {
    ...hotel,
    // Coerción de número para las estrellas
    estrellas: Number(hotel.estrellas) || 0,

    // Temporada: Asegurar que el porcentaje sea numérico
    temporada: hotel.temporada
      ? {
          ...hotel.temporada,
          porcentaje: Number(hotel.temporada.porcentaje) || 0,
        }
      : null,

    // Descuentos: Coerción de tipos para cada descuento
    descuentos: (hotel.descuentos || []).map((descuento) => ({
      ...descuento,
      porcentaje: Number(descuento.porcentaje) || 0,
      cantidad_de_habitaciones: Number(descuento.cantidad_de_habitaciones) || 0,
    })),

    // Habitaciones: Coerción de precio y capacidad
    habitaciones: (hotel.habitaciones || []).map((habitacion) => ({
      ...habitacion,
      precio: Number(habitacion.precio) || 0,
      capacidad: Number(habitacion.capacidad) || 0,
    })),

    // Paquetes: Coerción de noches, descuento y precios/capacidad de las habitaciones internas
    paquetes: (hotel.paquetes || []).map((paquete) => ({
      ...paquete,
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
 * Transforma un array de hoteles utilizando la función transformHotel.
 * @param {Array<Object>} hoteles - Array de objetos hotel crudos.
 * @returns {Array<Object>} - Array de hoteles transformados.
 */
export const transformHoteles = (hoteles) => {
  if (!Array.isArray(hoteles)) {
    return [];
  }
  return hoteles.map(transformHotel);
};
