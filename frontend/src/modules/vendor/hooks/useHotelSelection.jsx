import { useMemo, useCallback } from 'react';
import { useCarrito } from '@vendor-context/CarritoContext';
import {
  calcHotelTotalFromSelection,
  normalizeDiscount,
} from '@utils/pricingUtils';

function useHotelSelection(hotel) {
  const {
    getHotelEntry,
    getSelectedRoomIdsForHotel,
    getSelectedPackageIdsForHotel,
    agregarHabitacion,
    removerHabitacion,
    agregarPaquete,
    removerPaquete,
  } = useCarrito();

  const hotelId = hotel?.hotelId;

  const hotelEnCarrito = useMemo(
    () => getHotelEntry(hotelId),
    [getHotelEntry, hotelId]
  );

  const selectedRoomIds = useMemo(
    () => getSelectedRoomIdsForHotel(hotelId) || [],
    [getSelectedRoomIdsForHotel, hotelId]
  );

  const selectedPackages = useMemo(
    () => getSelectedPackageIdsForHotel(hotelId) || [],
    [getSelectedPackageIdsForHotel, hotelId]
  );

  const totalPrice = useMemo(() => {
    if (!hotel) return 0;
    const res = calcHotelTotalFromSelection(
      hotel,
      selectedRoomIds,
      selectedPackages,
      {}
    );
    return res?.final ?? 0;
  }, [hotel, selectedRoomIds, selectedPackages]);

  const discountCoefficient = useMemo(() => {
    if (!hotel?.temporada) return 0;
    const pct = normalizeDiscount(hotel.temporada.porcentaje);
    // Solo devolvemos un coeficiente de descuento si la temporada es baja
    return hotel.temporada.tipo === 'baja' ? pct : 0;
  }, [hotel?.temporada]);

  const addRoom = useCallback(
    (roomObj, fechas) => {
      if (typeof agregarHabitacion === 'function') {
        const hotelInfo = {
          hotelId: hotelId,
          nombre: hotel?.nombre ?? null,
          temporada: hotel?.temporada ?? null,
          descuentos: hotel?.descuentos ?? [],
        };
        return agregarHabitacion(hotelInfo, roomObj, fechas);
      }
      console.warn(
        'useHotelSelection.addRoom: agregarHabitacion no está disponible en CarritoContext'
      );
    },
    [agregarHabitacion, hotelId, hotel]
  );

  const removeRoom = useCallback(
    (roomId) => {
      if (typeof removerHabitacion === 'function') {
        return removerHabitacion(hotelId, roomId);
      }
      console.warn(
        'useHotelSelection.removeRoom: removerHabitacion no está disponible en CarritoContext'
      );
    },
    [removerHabitacion, hotelId]
  );

  const addPackage = useCallback(
    (pkgObj, fechas) => {
      if (typeof agregarPaquete === 'function') {
        const hotelInfo = {
          hotelId: hotelId,
          nombre: hotel?.nombre ?? null,
          temporada: hotel?.temporada ?? null,
          descuentos: hotel?.descuentos ?? [],
        };
        return agregarPaquete(hotelInfo, pkgObj, fechas);
      }
      console.warn(
        'useHotelSelection.addPackage: agregarPaquete no está disponible en CarritoContext'
      );
    },
    [agregarPaquete, hotelId, hotel]
  );

  const removePackage = useCallback(
    (pkgId) => {
      if (typeof removerPaquete === 'function') {
        return removerPaquete(hotelId, pkgId);
      }
      console.warn(
        'useHotelSelection.removePackage: removerPaquete no está disponible en CarritoContext'
      );
    },
    [removerPaquete, hotelId]
  );

  return {
    selectedRoomIds,
    selectedPackages,
    addRoom, // Mantenemos los nombres en inglés aquí para no romper los componentes que lo usan
    removeRoom,
    addPackage,
    removePackage,
    totalPrice,
    discountCoefficient,
    hotelEnCarrito,
  };
}

export default useHotelSelection;
