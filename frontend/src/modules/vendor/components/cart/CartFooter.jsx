import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteModal from '@client/ClienteModal';
import { calcRoomInstanceTotal, calcPackageTotal, calcDescuentoPorCantidad } from '@utils/pricingUtils';
import { useCarrito } from '@vendor-context/CarritoContext';
import { useBusqueda } from '@vendor-context/BusquedaContext';
import { usePago } from '@vendor-context/PagoContext';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';

// Pie del carrito con resumen de totales y botón de reservar
function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const { carrito, setReservaConfirmada } = useCarrito();
  const { filtros } = useBusqueda();
  const { vendedorId } = usePago();

  const totals = useMemo(() => {
    let finalSum = 0;
    let originalSum = 0;
    let descuentoHotelTotal = 0;

    (hotels || []).forEach((hotel) => {
      const temporada = hotel?.temporada ?? null;
      let hotelRoomFinal = 0;

      // Sumar habitaciones con temporada
      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          temporada,
          alquiler: {
            fechaInicio: room.fechaInicio,
            fechaFin: room.fechaFin,
          },
        });
        originalSum += calc.original;
        hotelRoomFinal += calc.final;
      });

      // Aplicar descuento por cantidad exacta de habitaciones
      const cantidadHabs = (hotel.habitaciones || []).length;
      const descInfo = calcDescuentoPorCantidad(
        cantidadHabs,
        hotel.descuentos,
        hotelRoomFinal
      );
      hotelRoomFinal -= descInfo.montoDescuento;
      descuentoHotelTotal += descInfo.montoDescuento;

      finalSum += hotelRoomFinal;

      // Sumar paquetes (sin descuento por cantidad)
      (hotel.paquetes || []).forEach((pack) => {
        const calc = calcPackageTotal({
          paquete: pack,
          temporada,
        });
        originalSum += calc.original;
        finalSum += calc.final;
      });
    });

    return {
      final: finalSum,
      original: originalSum,
      descuento: originalSum - finalSum,
      descuentoHotel: descuentoHotelTotal,
    };
  }, [hotels]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const isDisabled = hotels.length === 0;

  const handleReservar = () => {
    if (isDisabled || isReserving) return;
    setIsClienteModalOpen(true);
  };

  const handleCloseModal = async (clienteSeleccionado) => {
    if (!clienteSeleccionado) {
      setIsClienteModalOpen(false);
      return;
    }

    setIsReserving(true);
    setIsClienteModalOpen(false);

    const reservationPromise = async () => {
      const dataParaApi = carrito.hoteles.map((hotel) => {
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

        const alquiler = Array.from(grupos.values()).map((grupo) => {
          let montoHabitaciones = 0;
          let montoPaquetes = 0;

          grupo.habitaciones.forEach((hab) => {
            const calc = calcRoomInstanceTotal({
              precio: hab.precio,
              temporada: hotel?.temporada,
              alquiler: {
                fechaInicio: hab.fechaInicio,
                fechaFin: hab.fechaFin,
              },
            });
            montoHabitaciones += calc.final;
          });

          // Aplicar descuento por cantidad exacta
          const cantHabs = grupo.habitaciones.length;
          const descInfo = calcDescuentoPorCantidad(
            cantHabs,
            hotel.descuentos,
            montoHabitaciones
          );
          montoHabitaciones -= descInfo.montoDescuento;

          grupo.paquetes.forEach((pkg) => {
            const calc = calcPackageTotal({
              paquete: pkg,
              temporada: hotel?.temporada,
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
          vendedorId: vendedorId,
          clienteId: clienteSeleccionado.id,
          alquiler: alquiler,
        };
      });

      const response = await axiosInstance.post('/reservar', dataParaApi);
      return response.data;
    };

    try {
      const reservaConfirmada = await toast.promise(reservationPromise(), {
        loading: 'Confirmando reserva...',
        success: '¡Reserva creada con éxito!',
        error: (err) =>
          err.response?.data?.error || 'No se pudo crear la reserva.',
      });

      setReservaConfirmada(reservaConfirmada);

      if (typeof onClose === 'function') onClose();
      navigate('/pago');
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <>
      {/* Resumen de totales y acción de reserva */}
      <div className="rounded-lg border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {currencyFormatter.format(totals.final)}
            </div>
            {totals.descuento > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ahorrás: {currencyFormatter.format(totals.descuento)}
              </div>
            )}
          </div>
          <button
            onClick={handleReservar}
            disabled={isDisabled || isReserving}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${isDisabled || isReserving
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isReserving ? 'Reservando...' : 'Reservar'}
          </button>
        </div>
      </div>

      {isClienteModalOpen && (
        <ClienteModal
          onClose={() => setIsClienteModalOpen(false)}
          onClienteSelected={handleCloseModal}
        />
      )}
    </>
  );
}

export default CartFooter;
