import { useMemo, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import {
  calcHotelTotalFromSelection,
  normalizeDiscount,
} from '@utils/pricingUtils';

function useHotelSelection(hotel) {
  const carritoCtx = useCarrito();

  const hotelId = hotel?.hotelId;

  const hotelEnCarrito = useMemo(() => {
    return carritoCtx?.getHotelEntry
      ? carritoCtx.getHotelEntry(hotelId)
      : carritoCtx?.carrito?.hoteles?.find((h) => h.hotelId === hotelId) ||
          null;
  }, [carritoCtx, hotelId]);

  const selectedRoomIds = useMemo(() => {
    if (typeof carritoCtx?.getSelectedRoomIdsForHotel === 'function') {
      return carritoCtx.getSelectedRoomIdsForHotel(hotelId) || [];
    }
    return hotelEnCarrito?.habitaciones?.map((h) => h.id) || [];
  }, [carritoCtx, hotelEnCarrito, hotelId]);

  const selectedPackages = useMemo(() => {
    if (typeof carritoCtx?.getSelectedPackageIdsForHotel === 'function') {
      return carritoCtx.getSelectedPackageIdsForHotel(hotelId) || [];
    }
    return hotelEnCarrito?.paquetes?.map((p) => p.id) || [];
  }, [carritoCtx, hotelEnCarrito, hotelId]);

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

  // Callbacks: pass through fechas
  const addRoom = useCallback(
    (roomObj, fechas) => {
      if (typeof carritoCtx?.addRoom === 'function') {
        return carritoCtx.addRoom(hotelId, roomObj, fechas);
      }
      if (typeof carritoCtx?.agregarHabitacion === 'function') {
        // compatibilidad: agregarHabitacion(hotelInfo, habitacion, fechas)
        return carritoCtx.agregarHabitacion(
          {
            hotelId: hotelId,
            nombre: hotel?.nombre ?? null,
            temporada: hotel?.temporada ?? null,
          },
          roomObj,
          fechas
        );
      }
      console.warn(
        'useHotelSelection.addRoom: no hay función conocida en CarritoContext'
      );
    },
    [carritoCtx, hotelId, hotel]
  );

  const removeRoom = useCallback(
    (roomId) => {
      if (typeof carritoCtx?.removeRoom === 'function') {
        return carritoCtx.removeRoom(hotelId, roomId);
      }
      if (typeof carritoCtx?.removerHabitacion === 'function') {
        return carritoCtx.removerHabitacion(hotelId, roomId);
      }
      console.warn(
        'useHotelSelection.removeRoom: no hay función conocida en CarritoContext'
      );
    },
    [carritoCtx, hotelId]
  );

  const addPackage = useCallback(
    (pkgObj, fechas) => {
      if (typeof carritoCtx?.addPackage === 'function') {
        return carritoCtx.addPackage(hotelId, pkgObj, fechas);
      }
      if (typeof carritoCtx?.agregarPaquete === 'function') {
        return carritoCtx.agregarPaquete(
          {
            hotelId: hotelId,
            nombre: hotel?.nombre ?? null,
            temporada: hotel?.temporada ?? null,
          },
          pkgObj,
          fechas
        );
      }
      console.warn(
        'useHotelSelection.addPackage: no hay función conocida en CarritoContext'
      );
    },
    [carritoCtx, hotelId, hotel]
  );

  const removePackage = useCallback(
    (pkgId) => {
      if (typeof carritoCtx?.removePackage === 'function') {
        return carritoCtx.removePackage(hotelId, pkgId);
      }
      if (typeof carritoCtx?.removerPaquete === 'function') {
        return carritoCtx.removerPaquete(hotelId, pkgId);
      }
      console.warn(
        'useHotelSelection.removePackage: no hay función conocida en CarritoContext'
      );
    },
    [carritoCtx, hotelId]
  );

  return {
    selectedRoomIds,
    selectedPackages,
    addRoom,
    removeRoom,
    addPackage,
    removePackage,
    totalPrice,
    discountCoefficient,
    hotelEnCarrito,
  };
}

export default useHotelSelection;
