import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteModal from '../client/ClienteModal';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { usePago } from '@context/PagoContext';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';

function CartFooter({ hotels = [], onClose }) {
  const navigate = useNavigate();
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const { carrito } = useCarrito();
  const { filtros } = useBusqueda();
  const { vendedorId } = usePago();

  const totals = useMemo(() => {
    let finalSum = 0;
    let originalSum = 0;

    (hotels || []).forEach((hotel) => {
      const porcentajeTemporada = hotel?.temporada?.porcentaje ?? 0;

      (hotel.habitaciones || []).forEach((room) => {
        const calc = calcRoomInstanceTotal({
          precio: room.precio,
          porcentaje: porcentajeTemporada,
          alquiler: {
            fechaInicio: room.fechaInicio,
            fechaFin: room.fechaFin,
          },
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
      final: finalSum,
      original: originalSum,
      descuento: originalSum - finalSum,
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
          let montoTotal = 0;

          grupo.habitaciones.forEach((hab) => {
            const calc = calcRoomInstanceTotal({
              precio: hab.precio,
              porcentaje: hotel?.temporada?.porcentaje,
              alquiler: {
                fechaInicio: hab.fechaInicio,
                fechaFin: hab.fechaFin,
              },
              limite: hotel.temporada,
            });
            montoTotal += calc.final;
          });

          grupo.paquetes.forEach((pkg) => {
            const calc = calcPackageTotal({
              paquete: pkg,
              porcentaje: hotel?.temporada?.porcentaje,
            });
            montoTotal += calc.final;
          });

          return {
            fechaInicio: grupo.fechaInicio,
            fechaFin: grupo.fechaFin,
            pasajeros: filtros.capacidad || 1,
            montoTotal: montoTotal,
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

      if (typeof onClose === 'function') onClose();
      navigate('/pago', { state: { reservaConfirmada: reservaConfirmada } });
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <>
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
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
              isDisabled || isReserving
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
