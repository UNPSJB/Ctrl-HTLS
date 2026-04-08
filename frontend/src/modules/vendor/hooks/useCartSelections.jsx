import { useMemo } from 'react';
import dateUtils from '@utils/dateUtils';

const { nightsBetween } = dateUtils;

/**
 * Prepara la estructura de datos 'selections' requerida por calcCartTotal
 * a partir de una lista simple de habitaciones y paquetes.
 * @param {Array<object>} habitaciones - Lista de habitaciones.
 * @param {Array<object>} paquetes - Lista de paquetes.
 * @param {object|null} temporada - Objeto de temporada { tipo, porcentaje, fechaInicio, fechaFin }.
 * @returns {Array<object>} Array con la estructura de selecciones para el cálculo.
 */
export const useCartSelections = (
  habitaciones = [],
  paquetes = [],
  temporada = null
) => {
  return useMemo(() => {
    // Mapeo de habitaciones
    const selectedInstanceIds = habitaciones
      .map((h) => (h && h.id != null ? h.id : null))
      .filter((id) => id != null);

    const nightsByInstance = {};
    const qtyByInstance = {};

    habitaciones.forEach((h) => {
      if (!h || h.id == null) return;
      nightsByInstance[h.id] = nightsBetween(h.fechaInicio, h.fechaFin);
      qtyByInstance[h.id] =
        Number.isFinite(Number(h.qty)) && Number(h.qty) > 0 ? Number(h.qty) : 1;
    });

    // Mapeo de paquetes
    const selectedPackageIds = paquetes
      .map((p) => (p && p.id != null ? p.id : null))
      .filter((id) => id != null);

    const packageQtyMap = {};
    paquetes.forEach((p) => {
      if (!p || p.id == null) return;
      packageQtyMap[p.id] =
        Number.isFinite(Number(p.qty)) && Number(p.qty) > 0 ? Number(p.qty) : 1;
    });

    // Estructura final con el objeto temporada completo
    return [
      {
        hotel: {
          temporada: temporada ?? null,
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
  }, [habitaciones, paquetes, temporada]);
};
