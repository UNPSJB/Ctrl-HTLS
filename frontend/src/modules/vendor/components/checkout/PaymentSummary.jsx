import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useCliente } from '@vendor-context/ClienteContext';
import { usePago } from '@vendor-context/PagoContext';
import axiosInstance from '@api/axiosInstance';
import { calcRoomInstanceTotal, calcPackageTotal, calcDescuentoPorCantidad } from '@utils/pricingUtils';
import MetodoPago from './MetodoPago';
import FacturaSelector from './FacturaSelector';

// Resumen final de la transacción y procesamiento del pago
function PaymentSummary() {
  const navigate = useNavigate();
  const { carrito, reservaConfirmada, limpiarCarritoYReserva } = useCarrito();
  const { client } = useCliente();

  const {
    setMontoTotal,
    metodoPago,
    tipoFactura,
    montoEfectivo,
    montoTarjeta,
    clienteId,
    vendedorId,
    resetPago,
  } = usePago();

  const [isProcessing, setIsProcessing] = useState(false);

  // Cálculo desglosado de totales
  const breakdown = useMemo(() => {
    let subtotalHabitaciones = 0;
    let ajusteTemporadaHabs = 0;
    let descuentoCantidad = 0;
    let subtotalPaquetes = 0;
    let descuentoPaquetes = 0;
    let ajusteTemporadaPaquetes = 0;

    (carrito.hoteles || []).forEach((hotel) => {
      const temporada = hotel?.temporada ?? null;
      let hotelRoomOriginal = 0;
      let hotelRoomFinal = 0;

      // Habitaciones
      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          temporada,
          alquiler: { fechaInicio: room.fechaInicio, fechaFin: room.fechaFin },
        });
        hotelRoomOriginal += calc.original;
        hotelRoomFinal += calc.final;
      });

      subtotalHabitaciones += hotelRoomOriginal;
      ajusteTemporadaHabs += (hotelRoomFinal - hotelRoomOriginal);

      // Descuento por cantidad exacta
      const cantidadHabs = (hotel.habitaciones || []).length;
      const descInfo = calcDescuentoPorCantidad(
        cantidadHabs,
        hotel.descuentos,
        hotelRoomFinal
      );
      descuentoCantidad += descInfo.montoDescuento;

      // Paquetes
      (hotel.paquetes || []).forEach((pack) => {
        const calc = calcPackageTotal({
          paquete: pack,
          temporada,
        });
        subtotalPaquetes += calc.original;
        descuentoPaquetes += calc.descuentoPaqueteMonto;
        ajusteTemporadaPaquetes += calc.ajusteTemporadaMonto;
      });
    });

    const totalFinal = (subtotalHabitaciones + ajusteTemporadaHabs - descuentoCantidad)
                      + (subtotalPaquetes - descuentoPaquetes + ajusteTemporadaPaquetes);

    return {
      subtotalHabitaciones: Math.round(subtotalHabitaciones),
      ajusteTemporadaHabs: Math.round(ajusteTemporadaHabs),
      descuentoCantidad: Math.round(descuentoCantidad),
      subtotalPaquetes: Math.round(subtotalPaquetes),
      descuentoPaquetes: Math.round(descuentoPaquetes),
      ajusteTemporadaPaquetes: Math.round(ajusteTemporadaPaquetes),
      totalFinal: Math.round(totalFinal),
    };
  }, [carrito.hoteles]);

  const totalFinal = breakdown.totalFinal;

  useEffect(() => {
    setMontoTotal(totalFinal);
  }, [totalFinal, setMontoTotal]);

  const handlePayment = async () => {
    if (!reservaConfirmada || reservaConfirmada.length === 0) {
      toast.error('No se encontró una reserva confirmada para pagar.');
      return;
    }

    const finalClienteId = client?.id || clienteId;
    if (!finalClienteId) {
      toast.error('Faltan datos del cliente.');
      return;
    }

    setIsProcessing(true);

    try {
      const itemsRaw = reservaConfirmada.flatMap((grupo) =>
        Array.isArray(grupo.alquiler) ? grupo.alquiler : [grupo]
      );

      let alquileresPayload = itemsRaw
        .map((item) => ({
          alquilerId: item.id || item.alquilerId,
          subTotal: Number(
            item.subTotal || item.montoTotal || item.importe || 0
          ),
        }))
        .filter((i) => i.alquilerId);

      const sumaBackend = alquileresPayload.reduce(
        (acc, curr) => acc + curr.subTotal,
        0
      );

      if (Math.abs(sumaBackend - totalFinal) > 1.0 && totalFinal > 0) {
        const count = alquileresPayload.length;
        const base = Math.floor((totalFinal / count) * 100) / 100;
        let acum = 0;
        alquileresPayload.forEach((item, i) => {
          const val = i === count - 1 ? totalFinal - acum : base;
          item.subTotal = Number(val.toFixed(2));
          acum += base;
        });
      }

      const totalAEnviar = alquileresPayload.reduce(
        (acc, curr) => acc + curr.subTotal,
        0
      );

      let pagoEfectivoFinal = 0;
      let pagoTarjetaFinal = 0;

      if (metodoPago === 'Efectivo') {
        pagoEfectivoFinal = totalAEnviar;
        pagoTarjetaFinal = 0;
      } else if (
        metodoPago === 'Tarjeta' ||
        metodoPago === 'Debito' ||
        metodoPago === 'Crédito'
      ) {
        pagoEfectivoFinal = 0;
        pagoTarjetaFinal = totalAEnviar;
      } else if (metodoPago === 'Mixto') {
        pagoEfectivoFinal = Number(montoEfectivo || 0);
        pagoTarjetaFinal = Number(montoTarjeta || 0);

        if (Math.abs(pagoEfectivoFinal + pagoTarjetaFinal - totalAEnviar) > 1) {
          throw new Error(
            `Los montos (Efec: $${pagoEfectivoFinal} + Tarj: $${pagoTarjetaFinal}) no suman el total ($${totalAEnviar}).`
          );
        }
      }

      const payload = {
        alquileres: alquileresPayload,
        tipoFact: tipoFactura || 'B',
        medioPago: metodoPago,
        montoTarjeta: pagoTarjetaFinal,
        montoEfectivo: pagoEfectivoFinal,
        montonEfectivo: pagoEfectivoFinal,
        montoTotal: Number(totalAEnviar.toFixed(2)),
        vendedorId: vendedorId || 2,
        clienteId: finalClienteId,
      };

      const response = await axiosInstance.post('/confirmar-pago', payload);

      if (response.status === 201 || response.status === 200) {
        toast.success('¡Pago registrado con éxito!');
        limpiarCarritoYReserva();
        resetPago();
        navigate('/');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      const msg =
        error.response?.data?.error || error.message || 'Error desconocido';
      toast.error(`Error al pagar: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const canConfirm = totalFinal > 0 && !isProcessing;

  const tieneHabitaciones = breakdown.subtotalHabitaciones > 0;
  const tienePaquetes = breakdown.subtotalPaquetes > 0;

  return (
    <div className="rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      <div className="space-y-1 text-sm">
        {/* Sección Habitaciones */}
        {tieneHabitaciones && (
          <>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Habitaciones</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                ${breakdown.subtotalHabitaciones}
              </span>
            </div>

            {breakdown.ajusteTemporadaHabs !== 0 && (
              <div className={`flex justify-between pl-3 text-xs ${
                breakdown.ajusteTemporadaHabs < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                <span>
                  {breakdown.ajusteTemporadaHabs < 0 ? 'Temporada baja' : 'Temporada alta'}
                </span>
                <span className="font-medium">
                  {breakdown.ajusteTemporadaHabs < 0
                    ? `-$${Math.abs(breakdown.ajusteTemporadaHabs)}`
                    : `+$${breakdown.ajusteTemporadaHabs}`}
                </span>
              </div>
            )}

            {breakdown.descuentoCantidad > 0 && (
              <div className="flex justify-between pl-3 text-xs text-blue-600 dark:text-blue-400">
                <span>Desc. por cantidad</span>
                <span className="font-medium">-${breakdown.descuentoCantidad}</span>
              </div>
            )}
          </>
        )}

        {/* Sección Paquetes */}
        {tienePaquetes && (
          <>
            {tieneHabitaciones && (
              <div className="my-2 border-t border-dashed border-gray-200 dark:border-gray-700" />
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Paquetes</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                ${breakdown.subtotalPaquetes}
              </span>
            </div>

            {breakdown.descuentoPaquetes > 0 && (
              <div className="flex justify-between pl-3 text-xs text-green-600 dark:text-green-400">
                <span>Desc. paquete</span>
                <span className="font-medium">-${breakdown.descuentoPaquetes}</span>
              </div>
            )}

            {breakdown.ajusteTemporadaPaquetes !== 0 && (
              <div className={`flex justify-between pl-3 text-xs ${
                breakdown.ajusteTemporadaPaquetes < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                <span>
                  {breakdown.ajusteTemporadaPaquetes < 0 ? 'Temporada baja' : 'Temporada alta'}
                </span>
                <span className="font-medium">
                  {breakdown.ajusteTemporadaPaquetes < 0
                    ? `-$${Math.abs(breakdown.ajusteTemporadaPaquetes)}`
                    : `+$${breakdown.ajusteTemporadaPaquetes}`}
                </span>
              </div>
            )}
          </>
        )}

        {/* Total */}
        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              Total a cobrar
            </span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">
              ${totalFinal}
            </span>
          </div>
        </div>
      </div>

      {/* Método de pago y factura */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <MetodoPago
          baseTotal={totalFinal}
          clientPoints={Number(client?.puntos ?? 0)}
        />
        <FacturaSelector />
      </div>

      {/* Botón de confirmar */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handlePayment}
          disabled={!canConfirm}
          className={`flex w-full items-center justify-center rounded-lg px-4 py-3 font-semibold text-white transition-colors ${canConfirm
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400'
            }`}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </span>
          ) : (
            'Finalizar Reserva y Pagar'
          )}
        </button>
      </div>
    </div>
  );
}

export default PaymentSummary;
