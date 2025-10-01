/**
 * Transforma un objeto hotel del formato de backend (crudo) al formato optimizado para el frontend (limpio y estructurado).
 *
 * Objetivo: Coercionar tipos de datos (strings a Number/Date) y pre-calcular data común (hotelData, descuentos).
 *
 * @param {Object} hotel - Objeto hotel crudo desde la API.
 * @returns {Object} - Objeto hotel transformado con tipos de datos correctos y estructuras pre-calculadas.
 */
export const transformHotel = (hotel) => {
  if (!hotel) return null;

  // 1. Aplicar transformaciones básicas de coerción de tipos y estructuras
  const transformed = {
    ...hotel,
    // Categoría: Asegurar que las estrellas sean Number
    categoria: {
      ...hotel.categoria,
      estrellas: Number(hotel.categoria?.estrellas) || 0,
    },
    // Temporada: Asegurar tipos y manejar nulos
    temporada: hotel.temporada
      ? {
          ...hotel.temporada,
          porcentaje: Number(hotel.temporada.porcentaje) || 0,
          fechaInicio: hotel.temporada.fechaInicio
            ? new Date(hotel.temporada.fechaInicio)
            : null,
          fechaFin: hotel.temporada.fechaFin
            ? new Date(hotel.temporada.fechaFin)
            : null,
        }
      : null,
    // Descuentos: Coerción de tipos
    descuentos:
      hotel.descuentos?.map((descuento) => ({
        ...descuento,
        porcentaje: Number(descuento.porcentaje) || 0,
        cantidad_de_habitaciones:
          Number(descuento.cantidad_de_habitaciones) || 0,
      })) || [],
    // Habitaciones: Coerción de tipos Y NORMALIZACIÓN DE ESTRUCTURA
    habitaciones:
      hotel.habitaciones?.map((habitacion) => {
        // Lógica para encontrar la clave dinámica del tipo de habitación
        const tipoHabitacion = Object.keys(habitacion).find(
          (key) => key !== 'precio' && key !== 'capacidad'
        );

        return {
          tipo: tipoHabitacion,
          habitaciones: habitacion[tipoHabitacion] || [], // Array de instancias
          precio: Number(habitacion.precio) || 0,
          capacidad: Number(habitacion.capacidad) || 0,
        };
      }) || [],
    // Paquetes: Coerción de tipos
    paquetes:
      hotel.paquetes?.map((paquete) => ({
        ...paquete,
        noches: Number(paquete.noches) || 0,
        descuento: Number(paquete.descuento) || 0,
        habitaciones:
          paquete.habitaciones?.map((hab) => ({
            ...hab,
            capacidad: Number(hab.capacidad) || 0,
            precio: Number(hab.precio) || 0,
          })) || [],
      })) || [],
  };

  // 2. AÑADIR DATOS DERIVADOS para simplificar componentes:

  // 2.1. Datos Mínimos del Hotel para componentes hijos
  const hotelData = {
    hotelId: transformed.hotelId,
    nombre: transformed.nombre,
    temporada: transformed.temporada,
  };

  // 2.2. Descuentos Formateados para Componente Descuento.jsx
  // Solo se calcula el porcentaje entero y la cantidad, la vista se encarga del texto.
  const descuentosParaComponente =
    transformed.descuentos.length > 0
      ? transformed.descuentos.map((descuento) => {
          const porcentaje = Math.round(descuento.porcentaje * 100);
          return {
            id: descuento.id,
            porcentaje,
            cantidad: descuento.cantidad_de_habitaciones,
          };
        })
      : null;

  // Devolvemos el objeto transformado, con la data de visualización añadida
  return {
    ...transformed,
    hotelData, // Datos base para subcomponentes (HotelHeader, HabitacionItem)
    descuentos: descuentosParaComponente, // Data limpia para Descuento.jsx
  };
};

/**
 * Transforma un array de hoteles
 * @param {Array} hoteles - Array de objetos hotel
 * @returns {Array} - Array de hoteles transformados
 */
export const transformHoteles = (hoteles) => {
  return hoteles?.map(transformHotel) || [];
};
