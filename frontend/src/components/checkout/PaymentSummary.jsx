import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCarrito } from '@context/CarritoContext';
import { useCliente } from '@context/ClienteContext';
import { usePago } from '@context/PagoContext';
import axiosInstance from '@api/axiosInstance';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';
import MetodoPago from './MetodoPago';
import FacturaSelector from './FacturaSelector';

function PaymentSummary() {
  const navigate = useNavigate();
  const { carrito, reservaConfirmada, limpiarCarritoYReserva } = useCarrito();
  const { client } = useCliente();

  const {
    setMontoTotal,
    metodoPago, // 'Efectivo', 'Tarjeta', 'Mixto', etc.
    tipoFactura,
    montoEfectivo, // Valor que viene del input/contexto
    montoTarjeta, // Valor que viene del input/contexto
    clienteId,
    vendedorId,
    resetPago,
  } = usePago();

  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Cálculo del Total Visual (Fuente de verdad)
  const { totalOriginal, totalFinal, descuentoTotal } = useMemo(() => {
    let originalSum = 0;
    let finalSum = 0;

    (carrito.hoteles || []).forEach((hotel) => {
      const porcentajeTemporada = hotel?.temporada?.porcentaje ?? 0;

      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          porcentaje: porcentajeTemporada,
          alquiler: { fechaInicio: room.fechaInicio, fechaFin: room.fechaFin },
          limite: hotel.temporada,
        });
        originalSum += calc.original;
        finalSum += calc.final;
      });

      (hotel.paquetes || []).forEach((pack) => {
        const calc = calcPackageTotal({
          paquete: pack,
          porcentaje: porcentajeTemporada,
        });
        originalSum += calc.original;
        finalSum += calc.final;
      });
    });

    return {
      totalOriginal: originalSum,
      totalFinal: finalSum, // Este es el montoTotal real
      descuentoTotal: originalSum - finalSum,
    };
  }, [carrito.hoteles]);

  // Actualizamos el contexto con el total calculado
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
      // --- PASO 1: Preparar los items (Alquileres) ---
      // Usamos el "montoTotal" visual para corregir cualquier 0 que venga del backend
      const itemsRaw = reservaConfirmada.flatMap((grupo) =>
        Array.isArray(grupo.alquiler) ? grupo.alquiler : [grupo]
      );

      // Mapeamos y corregimos precios si es necesario
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

      // AUTO-CORRECCIÓN DE PRECIOS: Si la BD trajo 0, usamos el total visual distribuido
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

      // --- PASO 2: Lógica Estricta de Medios de Pago ---
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
        // En mixto respetamos lo que viene del input, asegurando que sean números
        pagoEfectivoFinal = Number(montoEfectivo || 0);
        pagoTarjetaFinal = Number(montoTarjeta || 0);

        // Validación extra: En mixto la suma debe coincidir
        if (Math.abs(pagoEfectivoFinal + pagoTarjetaFinal - totalAEnviar) > 1) {
          throw new Error(
            `Los montos (Efec: $${pagoEfectivoFinal} + Tarj: $${pagoTarjetaFinal}) no suman el total ($${totalAEnviar}).`
          );
        }
      }

      // --- PASO 3: Construcción del BODY Exacto ---
      const payload = {
        alquileres: alquileresPayload,
        tipoFact: tipoFactura || 'B',
        medioPago: metodoPago,

        // Campos de montos calculados según la lógica anterior
        montoTarjeta: pagoTarjetaFinal,

        // ENVIAMOS AMBOS: El correcto y el que tiene el TYPO del backend
        montoEfectivo: pagoEfectivoFinal,
        montonEfectivo: pagoEfectivoFinal, // <--- Aquí cubrimos el requerimiento del backend

        montoTotal: Number(totalAEnviar.toFixed(2)),
        vendedorId: vendedorId || 2,
        clienteId: finalClienteId,
      };

      console.log('Enviando pago:', payload); // Para depuración

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

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      {/* ... (resto del renderizado igual que antes) ... */}
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Resumen del Pago
      </h3>

      <div className="space-y-2 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            ${totalOriginal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Descuentos:</span>
          <span
            className={`font-medium ${descuentoTotal > 0 ? 'text-green-600' : 'text-gray-500'}`}
          >
            -${descuentoTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-3">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Total a Cubrir:
          </span>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">
            ${totalFinal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {/* Aquí MetodoPago permite al usuario elegir y setear montoEfectivo/montoTarjeta en el contexto */}
        <MetodoPago
          baseTotal={totalFinal}
          clientPoints={Number(client?.puntos ?? 0)}
        />
        <FacturaSelector />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handlePayment}
          disabled={!canConfirm}
          className={`flex w-full items-center justify-center rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
            canConfirm
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          {isProcessing ? 'Procesando...' : 'Finalizar Reserva y Pagar'}
        </button>
      </div>
    </div>
  );
}

export default PaymentSummary;
