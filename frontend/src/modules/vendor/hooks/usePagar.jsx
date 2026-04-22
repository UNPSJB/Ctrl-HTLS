import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '@api/axiosInstance';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useCliente } from '@vendor-context/ClienteContext';
import { useBusqueda } from '@vendor-context/BusquedaContext';
import { useAuth } from '@/context/AuthContext';
import { useCarritoPrecios } from './useCarritoPrecios';

/**
 * Hook que encapsula toda la lógica de confirmación de pago.
 * Extrae la responsabilidad de PaymentSummary.
 */
export function usePagar() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { reservaConfirmada, limpiarCarritoYReserva } = useCarrito();
  const { client, clearClient } = useCliente();
  const { limpiarFiltros } = useBusqueda();
  const { user } = useAuth();
  const { totalFinal } = useCarritoPrecios();

  const canConfirm = totalFinal > 0 && !isProcessing;

  const pagar = useCallback(
    async (paymentState) => {
      const { metodoPago, tipoFactura, montoEfectivo, montoTarjeta } =
        paymentState || {};

      if (!reservaConfirmada || reservaConfirmada.length === 0) {
        toast.error('No se encontró una reserva confirmada para pagar.');
        return;
      }

      const finalClienteId = client?.id;
      if (!finalClienteId) {
        toast.error('Faltan datos del cliente.');
        return;
      }

      setIsProcessing(true);

      try {
        // Extraer los alquileres de la respuesta de reserva
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

        // Ajustar montos si no coinciden con el total calculado en frontend
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

        // Calcular distribución según método de pago
        let pagoEfectivoFinal = 0;
        let pagoTarjetaFinal = 0;

        if (metodoPago === 'Efectivo' || metodoPago === 'Puntos') {
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
          montoTotal: Number(totalAEnviar.toFixed(2)),
          vendedorId: user?.id,
          clienteId: finalClienteId,
        };

        const response = await axiosInstance.post('/confirmar-pago', payload);

        if (response.status === 201 || response.status === 200) {
          // Cálculos simulados de puntos basados en las reglas del backend
          const puntosAnteriores = client?.puntos || 0;
          let puntosGanados = 0;
          let puntosGastados = 0;

          if (metodoPago === 'Efectivo') {
            puntosGanados = Math.floor(totalAEnviar / 5);
          } else if (metodoPago === 'Puntos') {
            puntosGastados = Math.ceil(totalAEnviar);
          }
          const puntosActuales = puntosAnteriores + puntosGanados - puntosGastados;

          // Redirección destructiva a la nueva página de éxito primero
          navigate('/pago/exito', {
            replace: true,
            state: {
              facturacionInfo: response.data,
              clienteNombre: client?.nombre,
              puntosGanados,
              puntosGastados,
              puntosActuales
            }
          });

          // Limpiamos los contextos de forma asíncrona para que PagoPage.jsx
          // se desmonte antes y su useEffect no intercepte la navegación llevándonos al Home (/).
          setTimeout(() => {
            limpiarCarritoYReserva();
            clearClient();
            limpiarFiltros();
          }, 0);
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        const msg =
          error.response?.data?.error || error.message || 'Error desconocido';
        toast.error(`Error al pagar: ${msg}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      reservaConfirmada,
      client?.id,
      totalFinal,
      user?.id,
      limpiarCarritoYReserva,
      clearClient,
      limpiarFiltros,
      navigate,
    ]
  );

  return { pagar, isProcessing, canConfirm };
}
