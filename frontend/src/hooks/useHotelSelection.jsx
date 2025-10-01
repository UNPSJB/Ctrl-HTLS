// useHotelSelection.js
import { useMemo, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import {
  calcHotelTotalFromSelection,
  normalizeDiscount,
} from '@utils/pricingUtils';

/**
 * useHotelSelection
 * - Llama a agregarHabitacion pasándole la metadata completa del hotel
 * - Devuelve selectedRoomIds / Set y callbacks estables
 * - Ignoramos fechas por ahora (se pueden añadir más tarde)
 */
function useHotelSelection(hotel) {
  const {
    getSelectedRoomIdsForHotel,
    getSelectedRoomsForHotel,
    getSelectedPackageIdsForHotel,
    agregarHabitacion, // usamos la API en español para pasar metadata completa
    removerHabitacion,
    agregarPaquete,
    removerPaquete,
    getHotelEntry,
  } = useCarrito();

  const hotelId = hotel?.hotelId;

  const selectedRoomIds = useMemo(
    () =>
      typeof getSelectedRoomIdsForHotel === 'function'
        ? getSelectedRoomIdsForHotel(hotelId) || []
        : [],
    [getSelectedRoomIdsForHotel, hotelId]
  );

  const selectedRoomIdsSet = useMemo(
    () => new Set(selectedRoomIds),
    [selectedRoomIds]
  );

  const selectedPackages = useMemo(
    () =>
      typeof getSelectedPackageIdsForHotel === 'function'
        ? getSelectedPackageIdsForHotel(hotelId) || []
        : [],
    [getSelectedPackageIdsForHotel, hotelId]
  );

  const selectedRoomsObjects = useMemo(
    () =>
      typeof getSelectedRoomsForHotel === 'function'
        ? getSelectedRoomsForHotel(hotelId) || []
        : [],
    [getSelectedRoomsForHotel, hotelId]
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
    return normalizeDiscount(hotel.temporada.porcentaje);
  }, [hotel?.temporada]);

  // CALLBACKS: delegan a las funciones del contexto, pero usando la firma que acepta metadata completa
  const addRoomToHotel = useCallback(
    (roomObj) => {
      // Llamamos a agregarHabitacion pasando metadata completa del hotel
      if (typeof agregarHabitacion === 'function') {
        agregarHabitacion(
          {
            hotelId: hotelId,
            nombre: hotel?.nombre ?? null,
            temporada: hotel?.temporada ?? null,
          },
          roomObj
          // fechas ignoradas por ahora
        );
      }
    },
    [agregarHabitacion, hotelId, hotel]
  );

  const removeRoomFromHotel = useCallback(
    (roomId) => {
      if (typeof removerHabitacion === 'function') {
        removerHabitacion(hotelId, roomId);
      }
    },
    [removerHabitacion, hotelId]
  );

  const addPackageToHotel = useCallback(
    (pkgObj) => {
      if (typeof agregarPaquete === 'function') {
        agregarPaquete(
          {
            hotelId: hotelId,
            nombre: hotel?.nombre ?? null,
            temporada: hotel?.temporada ?? null,
          },
          pkgObj
        );
      }
    },
    [agregarPaquete, hotelId, hotel]
  );

  const removePackageFromHotel = useCallback(
    (pkgId) => {
      if (typeof removerPaquete === 'function') {
        removerPaquete(hotelId, pkgId);
      }
    },
    [removerPaquete, hotelId]
  );

  const hotelEnCarrito = useMemo(
    () => (typeof getHotelEntry === 'function' ? getHotelEntry(hotelId) : null),
    [getHotelEntry, hotelId]
  );

  return {
    selectedRoomIds,
    selectedRoomIdsSet,
    selectedRoomsObjects,
    selectedPackages,
    addRoom: addRoomToHotel,
    removeRoom: removeRoomFromHotel,
    addPackage: addPackageToHotel,
    removePackage: removePackageFromHotel,
    totalPrice,
    discountCoefficient,
    hotelEnCarrito,
  };
}

export default useHotelSelection;
