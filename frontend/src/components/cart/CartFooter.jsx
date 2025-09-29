import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcCartTotal, calcNights } from '@utils/pricingUtils';
import ClienteModal from '../client/ClienteModal';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);

  const selections = useMemo(() => {
    if (!Array.isArray(hotels)) return [];

    return hotels.map((hotel) => {
      const habitaciones = Array.isArray(hotel.habitaciones)
        ? hotel.habitaciones
        : [];
      const paquetes = Array.isArray(hotel.paquetes) ? hotel.paquetes : [];

      const selectedInstanceIds = habitaciones
        .map((r) => r && (r.id !== undefined ? r.id : null))
        .filter((id) => id != null);

      const nightsByInstance = {};
      const qtyByInstance = {};

      habitaciones.forEach((r) => {
        if (!r || r.id == null) return;
        // calcNights devuelve al menos 1
        nightsByInstance[r.id] = calcNights(r.fechaInicio, r.fechaFin);
        qtyByInstance[r.id] = Number.isFinite(Number(r.qty))
          ? Math.max(1, Math.floor(Number(r.qty)))
          : 1;
      });

      const selectedPackageIds = paquetes
        .map((p) => p && (p.id !== undefined ? p.id : null))
        .filter((id) => id != null);

      const packageQtyMap = {};
      paquetes.forEach((p) => {
        if (!p || p.id == null) return;
        packageQtyMap[p.id] = Number.isFinite(Number(p.qty))
          ? Math.max(1, Math.floor(Number(p.qty)))
          : 1;
      });

      return {
        hotel,
        selectedInstanceIds,
        selectedPackageIds,
        options: {
          nightsByInstance,
          qtyByInstance,
          packageQtyMap,
        },
      };
    });
  }, [hotels]);

  // Calcula totales centralizados (fallback a 0 si la función no existe)
  const totals =
    typeof calcCartTotal === 'function'
      ? calcCartTotal(selections)
      : { final: 0, original: 0, descuento: 0, breakdown: [] };

  const handleReservar = () => {
    if (!hotels || hotels.length === 0) return;
    setIsClienteModalOpen(true);
  };

  const handleCloseClienteModal = () => {
    setIsClienteModalOpen(false);
  };

  const handleClienteSelected = (cliente) => {
    // Log / manejo mínimo; el modal puede guardar en contexto como haga falta
    console.log('Cliente seleccionado para la reserva:', cliente);
    setIsClienteModalOpen(false);
    onClose?.();
    navigate('/pago');
  };

  const isDisabled = !hotels || hotels.length === 0;

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${Number(totals.final ?? 0).toFixed(2)}
            </div>
            {Number(totals.descuento ?? 0) > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás: ${Number(totals.descuento ?? 0).toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={handleReservar}
            disabled={isDisabled}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
              isDisabled
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-disabled={isDisabled}
            title="Reservar / Pagar"
          >
            Reservar
          </button>
        </div>

        {/* Opcional: breakdown por hotel (pequeño resumen) */}
        {Array.isArray(totals.breakdown) && totals.breakdown.length > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {totals.breakdown.map((b) => (
              <div key={b.hotelId} className="flex justify-between">
                <span>Hotel {b.hotelId}</span>
                <span>${Number(b.final ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isClienteModalOpen && (
        <ClienteModal
          onClose={handleCloseClienteModal}
          onClienteSelected={handleClienteSelected}
        />
      )}
    </>
  );
}

export default CartFooter;
