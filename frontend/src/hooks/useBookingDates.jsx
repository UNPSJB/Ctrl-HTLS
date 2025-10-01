// useBookingDates.js
import { useCallback, useMemo } from 'react';
import { useBusqueda } from '@context/BusquedaContext';
import dateUtils from '@utils/dateUtils';

const { toISODate, normalizeDateValue, nightsBetween } = dateUtils;

/**
 * useBookingDates
 * - Wrapper ligero sobre useBusqueda que expone: valores para inputs, valores ISO, nightsBetween y setters.
 * - No cambia cómo tu formulario mantiene los inputs locales, pero facilita:
 *    * obtener fechas para pasar al carrito (ISO)
 *    * calcular noches
 *    * actualizar rango en el contexto
 */
function useBookingDates() {
  const { filtros, setDateRange, actualizarFiltros } = useBusqueda();

  // Valores para inputs: "YYYY-MM-DD" | ''
  const inputFechaInicio = useMemo(() => {
    const iso = toISODate(filtros?.fechaInicio);
    return iso ?? '';
  }, [filtros?.fechaInicio]);

  const inputFechaFin = useMemo(() => {
    const iso = toISODate(filtros?.fechaFin);
    return iso ?? '';
  }, [filtros?.fechaFin]);

  // Valores ISO normalizados (string ISO o null) — útil para persistencia / API
  const isoFechaInicio = useMemo(
    () => normalizeDateValue(filtros?.fechaInicio),
    [filtros?.fechaInicio]
  );
  const isoFechaFin = useMemo(
    () => normalizeDateValue(filtros?.fechaFin),
    [filtros?.fechaFin]
  );

  // nightsBetween helper (por defecto useUTC = true para evitar problemas de zona)
  const nights = useMemo(() => {
    if (!isoFechaInicio || !isoFechaFin) return 1;
    return nightsBetween(isoFechaInicio, isoFechaFin, {
      useUTC: true,
      minNights: 1,
    });
  }, [isoFechaInicio, isoFechaFin]);

  // Setea rango de fechas en el contexto (acepta: Date | ISO string | '' | null)
  const setRange = useCallback(
    (fechaInicio, fechaFin) => {
      // Usamos el action explícito del contexto
      if (typeof setDateRange === 'function') {
        setDateRange(fechaInicio ?? null, fechaFin ?? null);
      } else {
        // fallback: actualizarFiltros (mantiene compatibilidad)
        actualizarFiltros({
          fechaInicio: fechaInicio ?? null,
          fechaFin: fechaFin ?? null,
        });
      }
    },
    [setDateRange, actualizarFiltros]
  );

  return {
    // para inputs
    inputFechaInicio,
    inputFechaFin,
    // valores ISO o null
    isoFechaInicio,
    isoFechaFin,
    // nights
    nights,
    // setter
    setRange,
  };
}

export default useBookingDates;
