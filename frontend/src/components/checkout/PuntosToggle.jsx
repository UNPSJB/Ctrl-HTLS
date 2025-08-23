import React, { useMemo, useState, useEffect } from 'react';
import { useCliente } from '@context/ClienteContext';

/**
 * PuntosToggle
 * - No necesita props para leer puntos; usa useCliente()
 * - Regla visual: 1000 puntos => $10 (puedes cambiarla aquí)
 * - Tiene onToggle optional: (usePoints:boolean) => void
 */
export default function PuntosToggle({ onToggle, className = '' }) {
  const { client } = useCliente?.() ?? {};
  const clientPoints = Number(client?.puntos ?? 0);

  // UI local: si el usuario quiere usar puntos o no
  const [usePoints, setUsePoints] = useState(false);

  // calculo blocks/equivalencia local
  const { blocks, maxPointsAmount } = useMemo(() => {
    const b = Math.floor(clientPoints / 1000);
    return { blocks: b, maxPointsAmount: b * 10 };
  }, [clientPoints]);

  // Notificar al padre opcional
  useEffect(() => {
    if (typeof onToggle === 'function') onToggle(usePoints);
  }, [usePoints, onToggle]);

  return (
    <div
      className={`mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-yellow-800 dark:text-yellow-200">
          Usar Puntos
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={usePoints}
            onChange={(e) => setUsePoints(e.target.checked)}
            className="w-4 h-4"
            aria-checked={usePoints}
            aria-label="Usar puntos para el pago"
          />
        </label>
      </div>

      <div className="text-yellow-700 dark:text-yellow-300 text-sm">
        <div>Disponibles: {clientPoints} puntos</div>
        <div>Equivalen a: ${maxPointsAmount}</div>
        {usePoints && (
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
            Aplicando hasta ${maxPointsAmount} (bloques: {blocks}).
          </div>
        )}
      </div>
    </div>
  );
}
