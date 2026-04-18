import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '@api/axiosInstance';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useBusqueda } from '@vendor-context/BusquedaContext';
import { useAuth } from '@/context/AuthContext';
import { useCarritoPrecios } from './useCarritoPrecios';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';

/**
 * Hook que encapsula toda la lógica de creación de reserva.
 * Extrae la responsabilidad de CartFooter.
 *
 * Construye el payload agrupando habitaciones y paquetes por fechas,
 * y distribuye el descuento por cantidad proporcionalmente entre los grupos.
 */
export function useReservar() {
  const navigate = useNavigate();

  const { carrito, setReservaConfirmada, isReserving, setIsReserving } = useCarrito();
  const { filtros } = useBusqueda();
  const { user } = useAuth();
  const { porHotel } = useCarritoPrecios();

  const reservar = useCallback(
    async (clienteSeleccionado) => {
      if (!clienteSeleccionado) return;

      setIsReserving(true);

      const reservationPromise = async () => {
        const dataParaApi = carrito.hoteles.map((hotel) => {
          const temporada = hotel?.temporada ?? null;
          const hotelBreakdown = porHotel[hotel.hotelId];

          // Agrupar habitaciones y paquetes por rango de fechas
          const grupos = new Map();

          hotel.habitaciones.forEach((hab) => {
            const key = `${hab.fechaInicio}_${hab.fechaFin}`;
            if (!grupos.has(key)) {
              grupos.set(key, {
                fechaInicio: hab.fechaInicio,
                fechaFin: hab.fechaFin,
                habitaciones: [],
                paquetes: [],
              });
            }
            grupos.get(key).habitaciones.push(hab);
          });

          hotel.paquetes.forEach((pkg) => {
            const key = `${pkg.fechaInicio}_${pkg.fechaFin}`;
            if (!grupos.has(key)) {
              grupos.set(key, {
                fechaInicio: pkg.fechaInicio,
                fechaFin: pkg.fechaFin,
                habitaciones: [],
                paquetes: [],
              });
            }
            grupos.get(key).paquetes.push(pkg);
          });

          // Calcular montos por grupo, distribuyendo el descuento por cantidad proporcionalmente
          const descuentoTotalHotel = hotelBreakdown?.descuentoCantidad ?? 0;
          const totalHabsConTemporada = hotelBreakdown?.subtotalHabsConTemporada ?? 0;

          const alquiler = Array.from(grupos.values()).map((grupo) => {
            let montoHabitaciones = 0;
            let montoPaquetes = 0;

            // Calcular monto de habitaciones del grupo
            grupo.habitaciones.forEach((hab) => {
              const calc = calcRoomInstanceTotal({
                precio: hab.precio,
                temporada,
                alquiler: {
                  fechaInicio: hab.fechaInicio,
                  fechaFin: hab.fechaFin,
                },
              });
              montoHabitaciones += calc.final;
            });

            // Distribuir el descuento por cantidad proporcionalmente al grupo
            if (descuentoTotalHotel > 0 && totalHabsConTemporada > 0) {
              const proporcion = montoHabitaciones / totalHabsConTemporada;
              const descuentoGrupo = Math.round(descuentoTotalHotel * proporcion);
              montoHabitaciones -= descuentoGrupo;
            }

            // Calcular monto de paquetes del grupo
            grupo.paquetes.forEach((pkg) => {
              const calc = calcPackageTotal({
                paquete: pkg,
                temporada,
              });
              montoPaquetes += calc.final;
            });

            const montoCalculado = montoHabitaciones + montoPaquetes;

            return {
              fechaInicio: grupo.fechaInicio,
              fechaFin: grupo.fechaFin,
              pasajeros: filtros.capacidad || 1,
              montoTotal: montoCalculado,
              subTotal: montoCalculado,
              habitaciones: grupo.habitaciones.map((h) => h.id),
              paquetes: grupo.paquetes.map((p) => p.id),
            };
          });

          return {
            hotelId: hotel.hotelId,
            vendedorId: user?.id,
            clienteId: clienteSeleccionado.id,
            alquiler,
          };
        });

        const response = await axiosInstance.post('/reservar', dataParaApi);
        return response.data;
      };

      try {
        const reservaData = await toast.promise(reservationPromise(), {
          loading: 'Confirmando reserva...',
          success: '¡Reserva creada con éxito!',
          error: (err) =>
            err.response?.data?.error || 'No se pudo crear la reserva.',
        });

        setReservaConfirmada(reservaData);
        navigate('/pago');
      } catch (error) {
        console.error('Error al procesar la reserva:', error);
      } finally {
        setIsReserving(false);
      }
    },
    [carrito.hoteles, porHotel, filtros.capacidad, user?.id, setReservaConfirmada, navigate]
  );

  return { reservar, isReserving };
}
