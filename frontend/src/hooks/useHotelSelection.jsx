import { useMemo } from 'react';
import { useCarrito } from '@context/CarritoContext';
import { calcularTotalHotel } from '@utils/pricingUtils';

/**
 * Hook para reflejar la selección REAL (desde el carrito) y calcular el total
 * del hotel actual usando pricingUtils.
 */
const useHotelSelection = (hotel) => {
  const { carrito } = useCarrito();

  const hotelEnCarrito = useMemo(
    () => carrito.hoteles.find((h) => h.idHotel === hotel.id) || null,
    [carrito.hoteles, hotel.id]
  );

  const selectedRooms = useMemo(
    () => (hotelEnCarrito?.habitaciones || []).map((h) => h.id),
    [hotelEnCarrito]
  );

  const selectedPackages = useMemo(
    () => (hotelEnCarrito?.paquetes || []).map((p) => p.id),
    [hotelEnCarrito]
  );

  const totalPrice = useMemo(() => {
    if (!hotelEnCarrito) return 0;
    const { final } = calcularTotalHotel(hotelEnCarrito);
    return final;
  }, [hotelEnCarrito]);

  // Para compatibilidad con el código existente:
  const toggleRoomSelection = () => {};
  const togglePackageSelection = () => {};

  const discountCoefficient =
    hotel.temporada === 'alta' ? hotel.coeficiente : 0;

  return {
    selectedRooms,
    selectedPackages,
    toggleRoomSelection,
    togglePackageSelection,
    totalPrice,
    discountCoefficient,
  };
};

export default useHotelSelection;
