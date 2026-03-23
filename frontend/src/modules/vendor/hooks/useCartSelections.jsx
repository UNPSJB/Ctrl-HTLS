import { useMemo } from 'react';
import dateUtils from '@utils/dateUtils';

const { nightsBetween } = dateUtils;

/**
 * Prepara la estructura de datos 'selections' requerida por calcCartTotal
 * a partir de una lista simple de habitaciones y paquetes.
 * @param {Array<object>} habitaciones - Lista de habitaciones.
 * @param {Array<object>} paquetes - Lista de paquetes.
 * @param {number} porcentaje - Porcentaje de descuento/recargo de la temporada.
 * @param {boolean} isHighSeason - Indicador manual de temporada alta.
 * @returns {Array<object>} Array con la estructura de selecciones para el cálculo.
 */
export const useCartSelections = (
  habitaciones = [],
  paquetes = [],
  porcentaje = 0,
  isHighSeason
) => {
  // Memoizamos el resultado para evitar recálculos innecesarios.
  return useMemo(() => {
    // 1. Derivamos si es temporada alta a partir del porcentaje (por compatibilidad)
    const effectiveHighSeason =
      typeof isHighSeason === 'boolean'
        ? isHighSeason
        : Boolean(Number(porcentaje) > 0);

    // 2. Mapeo de habitaciones
    const selectedInstanceIds = habitaciones
      .map((h) => (h && h.id != null ? h.id : null))
      .filter((id) => id != null);

    const nightsByInstance = {};
    const qtyByInstance = {};

    habitaciones.forEach((h) => {
      if (!h || h.id == null) return;
      // USAMOS EL MÉTODO CORRECTO: nightsBetween
      nightsByInstance[h.id] = nightsBetween(h.fechaInicio, h.fechaFin);
      qtyByInstance[h.id] =
        Number.isFinite(Number(h.qty)) && Number(h.qty) > 0 ? Number(h.qty) : 1;
    });

    // 3. Mapeo de paquetes
    const selectedPackageIds = paquetes
      .map((p) => (p && p.id != null ? p.id : null))
      .filter((id) => id != null);

    const packageQtyMap = {};
    paquetes.forEach((p) => {
      if (!p || p.id == null) return;
      packageQtyMap[p.id] =
        Number.isFinite(Number(p.qty)) && Number(p.qty) > 0 ? Number(p.qty) : 1;
    });

    // 4. Construcción de la estructura final (asumimos un solo "hotel" para este resumen)
    return [
      {
        hotel: {
          temporada: {
            // Aplicamos el porcentaje de la temporada si es efectiva
            porcentaje: effectiveHighSeason ? Number(porcentaje) || 0 : 0,
          },
        },
        selectedInstanceIds,
        selectedPackageIds,
        options: {
          nightsByInstance,
          qtyByInstance,
          packageQtyMap,
        },
      },
    ];
  }, [habitaciones, paquetes, porcentaje, isHighSeason]);
};
