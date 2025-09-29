import { useMemo, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import {
  calcHotelTotalFromSelection,
  normalizeDiscount,
} from '@utils/pricingUtils';

function useHotelSelection(hotel) {
  const carritoCtx = useCarrito();
  const carrito = carritoCtx?.carrito || { hoteles: [] };

  // Buscar la entrada del hotel en el carrito por hotelId (coincide con HotelCard)
  const hotelEnCarrito = useMemo(
    () => carrito.hoteles.find((h) => h.hotelId === hotel?.hotelId) || null,
    [carrito.hoteles, hotel?.hotelId]
  );

  // IDs de habitaciones seleccionadas (si el carrito guarda instancias con { id })
  const selectedRooms = useMemo(
    () => (hotelEnCarrito?.habitaciones || []).map((h) => h.id),
    [hotelEnCarrito]
  );

  // IDs de paquetes seleccionados
  const selectedPackages = useMemo(
    () => (hotelEnCarrito?.paquetes || []).map((p) => p.id),
    [hotelEnCarrito]
  );

  // Total calculado usando pricingUtils (se calcula con el hotel original + selección)
  const totalPrice = useMemo(() => {
    if (!hotel) return 0;
    const res = calcHotelTotalFromSelection(
      hotel,
      selectedRooms,
      selectedPackages,
      {
        // si tu cart almacena nights/qty podrías pasarlas aquí
      }
    );
    return res?.final || 0;
  }, [hotel, selectedRooms, selectedPackages]);

  // Coeficiente de descuento de la temporada: normalizamos hotel.temporada.porcentaje
  const discountCoefficient = useMemo(() => {
    if (!hotel?.temporada) return 0;
    return normalizeDiscount(hotel.temporada.porcentaje);
  }, [hotel?.temporada]);

  /**
   * Toggle helpers: intentan llamar funciones del contexto con nombres comunes.
   * Si tu CarritoContext expone otros nombres, agrégalos en los checks.
   */

  const toggleRoomSelection = useCallback(
    (roomId) => {
      // Intentamos varias API comunes del contexto
      if (!carritoCtx) return;
      if (typeof carritoCtx.toggleRoom === 'function')
        return carritoCtx.toggleRoom(hotel.hotelId, roomId);
      if (typeof carritoCtx.toggleRoomSelection === 'function')
        return carritoCtx.toggleRoomSelection(hotel.hotelId, roomId);
      if (
        typeof carritoCtx.addRoom === 'function' &&
        typeof carritoCtx.removeRoom === 'function'
      ) {
        // fallback simple: si ya está en selección, removemos, si no, agregamos
        const isSelected = selectedRooms.includes(roomId);
        return isSelected
          ? carritoCtx.removeRoom(hotel.hotelId, roomId)
          : carritoCtx.addRoom(hotel.hotelId, roomId);
      }
      console.warn(
        'toggleRoomSelection: el CarritoContext no expone una API conocida (toggleRoom/toggleRoomSelection/addRoom/removeRoom).'
      );
    },
    [carritoCtx, hotel?.hotelId, selectedRooms]
  );

  const togglePackageSelection = useCallback(
    (packageId) => {
      if (!carritoCtx) return;
      if (typeof carritoCtx.togglePackage === 'function')
        return carritoCtx.togglePackage(hotel.hotelId, packageId);
      if (typeof carritoCtx.togglePackageSelection === 'function')
        return carritoCtx.togglePackageSelection(hotel.hotelId, packageId);
      if (
        typeof carritoCtx.addPackage === 'function' &&
        typeof carritoCtx.removePackage === 'function'
      ) {
        const isSelected = selectedPackages.includes(packageId);
        return isSelected
          ? carritoCtx.removePackage(hotel.hotelId, packageId)
          : carritoCtx.addPackage(hotel.hotelId, packageId);
      }
      console.warn(
        'togglePackageSelection: el CarritoContext no expone una API conocida (togglePackage/togglePackageSelection/addPackage/removePackage).'
      );
    },
    [carritoCtx, hotel?.hotelId, selectedPackages]
  );

  return {
    selectedRooms,
    selectedPackages,
    toggleRoomSelection,
    togglePackageSelection,
    totalPrice,
    discountCoefficient,
    hotelEnCarrito, // útil para componentes que quieran más info
  };
}

export default useHotelSelection;
