import { memo, useState, useMemo, useCallback } from 'react';
import { Calendar, Percent, Info } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import { calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import useBookingDates from '@hooks/useBookingDates';

function PaqueteItem({
  hotelData = null,
  hotelId = null,
  paquete,
  isSelected = false,
  onSelect = null,
}) {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);

  // Fechas desde hook central (ISO strings o null)
  const { isoFechaInicio, isoFechaFin } = useBookingDates();

  // Carrito (fallback si no hay onSelect)
  const carrito = useCarrito();

  // Calculo de precios (memo)
  const { precioTemporada: precioBase, precioDescuento } = useMemo(() => {
    return calcPackageTotal({
      paquete,
      porcentaje: hotelData?.temporada?.porcentaje,
    });
  }, [paquete, hotelData?.temporada?.porcentaje]);

  // Toggle selection (invocado por el checkbox)
  const manejarSeleccion = useCallback(
    (e) => {
      const checked = Boolean(e.target.checked);

      // Notificamos al padre siempre (si existe) para UI controlada
      if (typeof onSelect === 'function') {
        onSelect(paquete.id);
        return;
      }

      // Si no hay onSelect, fallback al contexto
      const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };
      try {
        if (checked) {
          // Preferir wrapper nuevo addPackage(hotelId, pkgObj, fechas)
          if (typeof carrito?.addPackage === 'function') {
            carrito.addPackage(hotelId ?? hotelData?.hotelId, paquete, fechas);
          } else if (typeof carrito?.agregarPaquete === 'function') {
            carrito.agregarPaquete(
              {
                hotelId: hotelId ?? hotelData?.hotelId,
                nombre: hotelData?.nombre ?? null,
                temporada: hotelData?.temporada ?? null,
              },
              paquete,
              fechas
            );
          } else {
            console.warn(
              'PaqueteItem: no hay función para agregar paquete en CarritoContext'
            );
          }
        } else {
          // Remover paquete
          if (typeof carrito?.removePackage === 'function') {
            carrito.removePackage(hotelId ?? hotelData?.hotelId, paquete.id);
          } else if (typeof carrito?.removerPaquete === 'function') {
            carrito.removerPaquete(hotelId ?? hotelData?.hotelId, paquete.id);
          } else {
            console.warn(
              'PaqueteItem: no hay función para remover paquete en CarritoContext'
            );
          }
        }
      } catch (err) {
        console.warn('PaqueteItem: error manipulando paquete en carrito', err);
      }
    },
    [
      onSelect,
      paquete,
      carrito,
      hotelId,
      hotelData,
      isoFechaInicio,
      isoFechaFin,
    ]
  );

  const handleShowDetails = useCallback((e) => {
    e?.stopPropagation();
    setMostrarModal(true);
  }, []);

  const handleCloseModal = useCallback(() => setMostrarModal(false), []);

  const handleReserveFromModal = useCallback(() => {
    // Intentamos delegar al padre si existe
    if (typeof onSelect === 'function') {
      if (!isSelected) onSelect(paquete.id);
    } else {
      const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };
      if (typeof carrito?.addPackage === 'function') {
        carrito.addPackage(hotelId ?? hotelData?.hotelId, paquete, fechas);
      } else if (typeof carrito?.agregarPaquete === 'function') {
        carrito.agregarPaquete(
          {
            hotelId: hotelId ?? hotelData?.hotelId,
            nombre: hotelData?.nombre ?? null,
            temporada: hotelData?.temporada ?? null,
          },
          paquete,
          fechas
        );
      } else {
        console.warn(
          'PaqueteItem: no hay función para agregar paquete en CarritoContext'
        );
      }
    }
    setMostrarModal(false);
  }, [
    onSelect,
    isSelected,
    paquete,
    carrito,
    hotelId,
    hotelData,
    isoFechaInicio,
    isoFechaFin,
  ]);

  return (
    <>
      <article className="grid grid-cols-3 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        <div className="col-span-2 flex items-center gap-4">
          <input
            type="checkbox"
            id={`package-${paquete.id}-checkbox`}
            checked={Boolean(isSelected)}
            onChange={manejarSeleccion}
            className="h-5 w-5 cursor-pointer"
            aria-labelledby={`package-${paquete.id}-title`}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {paquete.nombre}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{paquete.noches}</span>
              </div>

              {paquete.descuento > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span>{(paquete.descuento * 100).toFixed(0)}%</span>
                </div>
              )}

              <button
                onClick={handleShowDetails}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                type="button"
              >
                <Info className="h-4 w-4" />
                <span>Detalles</span>
              </button>
            </div>

            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {paquete.descripcion}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="text-right">
            <PriceTag precio={precioDescuento} original={precioBase} />
          </div>
        </div>
      </article>

      {mostrarModal && (
        <PaqueteDetailsModal
          paquete={paquete}
          temporada={hotelData?.temporada}
          onClose={handleCloseModal}
          onReserve={handleReserveFromModal}
        />
      )}
    </>
  );
}

export default memo(PaqueteItem);
