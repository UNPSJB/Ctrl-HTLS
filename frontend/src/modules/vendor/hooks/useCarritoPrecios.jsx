import { useMemo } from 'react';
import { useCarrito } from '@vendor-context/CarritoContext';
import {
  calcRoomInstanceTotal,
  calcPackageTotal,
  calcDescuentoPorCantidad,
} from '@utils/pricingUtils';

/**
 * Hook centralizado que calcula TODOS los precios del carrito.
 * Fuente única de verdad para totales, subtotales y descuentos.
 *
 * Reglas de negocio aplicadas:
 * - Temporada: se aplica solo a las noches que caen dentro del rango de la temporada (overlap parcial).
 * - Descuento por cantidad: se cuenta sobre TODAS las habitaciones del hotel (sin importar tipo ni fechas).
 *   Solo aplica si la cantidad EXACTA coincide con algún descuento configurado.
 * - Paquetes: NO cuentan para el descuento por cantidad.
 */
export function useCarritoPrecios() {
  const { carrito } = useCarrito();

  const resultado = useMemo(() => {
    const porHotel = {};
    let totalOriginal = 0;
    let totalFinal = 0;

    (carrito.hoteles || []).forEach((hotel) => {
      const temporada = hotel?.temporada ?? null;
      const hotelId = hotel.hotelId;

      // --- Habitaciones ---
      let subtotalHabsOriginal = 0;
      let subtotalHabsFinal = 0;

      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          temporada,
          alquiler: {
            fechaInicio: room.fechaInicio,
            fechaFin: room.fechaFin,
          },
        });
        subtotalHabsOriginal += calc.original;
        subtotalHabsFinal += calc.final;
      });

      const ajusteTemporadaHabs = subtotalHabsFinal - subtotalHabsOriginal;

      // --- Descuento por cantidad exacta (sobre TODAS las habs del hotel) ---
      const cantidadHabs = (hotel.habitaciones || []).length;
      const descInfo = calcDescuentoPorCantidad(
        cantidadHabs,
        hotel.descuentos,
        subtotalHabsFinal
      );

      const habsFinalConDescuento = subtotalHabsFinal - descInfo.montoDescuento;

      // --- Paquetes ---
      let subtotalPaquetesOriginal = 0;
      let descuentoPaquetes = 0;
      let ajusteTemporadaPaquetes = 0;
      let paquetesFinal = 0;

      (hotel.paquetes || []).forEach((pack) => {
        const calc = calcPackageTotal({
          paquete: pack,
          temporada,
        });
        subtotalPaquetesOriginal += calc.original;
        descuentoPaquetes += calc.descuentoPaqueteMonto;
        ajusteTemporadaPaquetes += calc.ajusteTemporadaMonto;
        paquetesFinal += calc.final;
      });

      // --- Subtotal del hotel ---
      const subtotalHotel = Math.round(habsFinalConDescuento + paquetesFinal);

      porHotel[hotelId] = {
        subtotalHabsOriginal: Math.round(subtotalHabsOriginal),
        ajusteTemporadaHabs: Math.round(ajusteTemporadaHabs),
        subtotalHabsConTemporada: Math.round(subtotalHabsFinal),
        descuentoCantidad: Math.round(descInfo.montoDescuento),
        porcentajeDescCantidad: descInfo.porcentajeAplicado,
        cantidadHabs,
        subtotalPaquetesOriginal: Math.round(subtotalPaquetesOriginal),
        descuentoPaquetes: Math.round(descuentoPaquetes),
        ajusteTemporadaPaquetes: Math.round(ajusteTemporadaPaquetes),
        subtotalHotel,
      };

      // Acumular totales globales
      totalOriginal += subtotalHabsOriginal + subtotalPaquetesOriginal;
      totalFinal += subtotalHotel;
    });

    return {
      porHotel,
      totalOriginal: Math.round(totalOriginal),
      totalFinal: Math.round(totalFinal),
      totalDescuento: Math.round(totalOriginal - totalFinal),
    };
  }, [carrito.hoteles]);

  return resultado;
}
