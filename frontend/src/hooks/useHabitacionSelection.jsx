import { useState, useMemo, useCallback } from 'react';
import { useCarrito } from '@context/CarritoContext';
import useBookingDates from '@hooks/useBookingDates';
import { calcSeasonalPrice } from '@utils/pricingUtils';
import { dateRangesOverlap } from '@utils/dateUtils';

export const useHabitacionSelection = (
  hotelData,
  habitacionTipo,
  onAdd,
  onRemove
) => {
  const [showModal, setShowModal] = useState(false);
  const { isoFechaInicio, isoFechaFin } = useBookingDates();
  const { carrito } = useCarrito();

  const {
    tipo,
    capacidad,
    precio: precioBase,
    habitaciones: todasLasInstancias,
  } = habitacionTipo;

  const totalInstancias = todasLasInstancias.length;

  const hotelEnCarrito = useMemo(() => {
    return carrito.hoteles.find((h) => h.hotelId === hotelData?.hotelId);
  }, [carrito.hoteles, hotelData?.hotelId]);

  const {
    instanciasOcupadasEnFechasActuales,
    instanciasDisponiblesParaAgregar,
  } = useMemo(() => {
    const rangoBusquedaActual = {
      fechaInicio: isoFechaInicio,
      fechaFin: isoFechaFin,
    };

    if (!hotelEnCarrito) {
      return {
        instanciasOcupadasEnFechasActuales: [],
        instanciasDisponiblesParaAgregar: todasLasInstancias,
      };
    }

    const habitacionesEnCarritoDeEsteTipo = hotelEnCarrito.habitaciones.filter(
      (h) => todasLasInstancias.some((inst) => inst.id === h.id)
    );

    const ocupadas = habitacionesEnCarritoDeEsteTipo.filter((h) =>
      dateRangesOverlap(rangoBusquedaActual, h)
    );

    const idsOcupadas = new Set(ocupadas.map((h) => h.id));
    const disponibles = todasLasInstancias.filter(
      (inst) => !idsOcupadas.has(inst.id)
    );

    return {
      instanciasOcupadasEnFechasActuales: ocupadas,
      instanciasDisponiblesParaAgregar: disponibles,
    };
  }, [hotelEnCarrito, todasLasInstancias, isoFechaInicio, isoFechaFin]);

  const selectedCount = instanciasOcupadasEnFechasActuales.length;

  const { precioFinal, precioOriginal } = useMemo(() => {
    const final = hotelData?.temporada
      ? calcSeasonalPrice(precioBase, hotelData.temporada.porcentaje)
      : precioBase;
    return { precioFinal: final, precioOriginal: precioBase };
  }, [precioBase, hotelData]);

  const handleIncrement = useCallback(() => {
    if (instanciasDisponiblesParaAgregar.length === 0 || !onAdd) return;

    const instanciaParaAgregar = instanciasDisponiblesParaAgregar[0];
    if (!instanciaParaAgregar) return;

    const habitacionCompleta = {
      ...instanciaParaAgregar,
      tipo,
      capacidad,
      precio: precioBase,
      nombre: tipo,
    };

    const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };
    onAdd(habitacionCompleta, fechas);
  }, [
    instanciasDisponiblesParaAgregar,
    tipo,
    capacidad,
    precioBase,
    onAdd,
    isoFechaInicio,
    isoFechaFin,
  ]);

  const handleDecrement = useCallback(() => {
    if (selectedCount <= 0 || !onRemove) return;

    if (instanciasOcupadasEnFechasActuales.length > 0) {
      const instanciaARemover =
        instanciasOcupadasEnFechasActuales[
          instanciasOcupadasEnFechasActuales.length - 1
        ];
      onRemove(instanciaARemover._cartId);
    }
  }, [selectedCount, onRemove, instanciasOcupadasEnFechasActuales]);

  const handleShowDetails = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleReserveFromModal = () => {
    setShowModal(false);
    handleIncrement();
  };

  return {
    showModal,
    selectedCount,
    precioFinal,
    precioOriginal,
    maxAvailable: totalInstancias,
    handleIncrement,
    handleDecrement,
    handleShowDetails,
    handleCloseModal,
    handleReserveFromModal,
  };
};
