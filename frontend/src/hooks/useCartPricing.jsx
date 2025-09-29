import { useMemo } from 'react';
import { useCarrito } from '../context/CarritoContext';
import pricingUtils from '../utils/pricingUtils';

const { calcCartTotal } = pricingUtils;

/**
 * Custom hook para calcular los totales del carrito.
 * Combina el estado del carrito con las utilidades de precio.
 */
export const useCartPricing = () => {
  const { carrito } = useCarrito();

  // Memoizamos el cálculo para que solo se ejecute cuando el contenido del carrito cambie
  const cartTotal = useMemo(() => {
    // Transformamos la estructura del estado del carrito a la estructura esperada por calcCartTotal
    const hotelsSelections = carrito.hoteles.map((hotel) => {
      // Necesitas los IDs de los elementos seleccionados
      const selectedInstanceIds = hotel.habitaciones.map((h) => h.id);
      const selectedPackageIds = hotel.paquetes.map((p) => p.id);

      const options = {
        // Aquí se agregarían nightsByInstance o qtyByInstance si el carrito lo gestionara.
        // Por ahora se deja vacío para que las utilidades usen los valores por defecto (1).
        qtyByInstance: {},
        packageQtyMap: {},
      };

      return {
        // Se asume que el objeto 'hotel' en el estado tiene la estructura de datos raw
        // (paquetes, habitaciones, temporada) que requiere calcCartTotal.
        hotel: hotel,
        selectedInstanceIds,
        selectedPackageIds,
        options,
      };
    });

    return calcCartTotal(hotelsSelections);
  }, [carrito.hoteles]); // Dependencia clave: el array de hoteles del estado

  return {
    cartTotal,
    isLoading: false,
  };
};
