// PaqueteItem.jsx
import { memo, useState, useMemo, useCallback } from 'react';
import { Calendar, Percent, Info } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { calcPackageTotal, normalizeDiscount } from '@utils/pricingUtils';

/*
  PaqueteItem
  - Recibe: hotelData (opcional) o hotelId (recomendado), paquete, isSelected, onSelect (callback del padre)
  - Comportamiento:
    * Si onSelect está presente -> lo notifica (HotelCard controlará agregar/quitar).
    * Si onSelect NO está -> usa directamente addPackage / agregarPaquete del contexto.
    * No se envían fechas (ignoradas por ahora).
*/

function PaqueteItem({
  hotelData = null,
  hotelId = null,
  paquete,
  isSelected = false,
  onSelect = null,
}) {
  if (!paquete) return null;
  // Determinar hotelId y hotelInfo para compatibilidad con API antigua
  const resolvedHotelId = hotelId ?? hotelData?.hotelId ?? null;
  const hotelInfo = {
    hotelId: resolvedHotelId,
    nombre: hotelData?.nombre ?? null,
    temporada: hotelData?.temporada ?? null,
  };

  // Contexto del carrito: preferimos los wrappers addPackage/removePackage
  const carrito = useCarrito();
  const addPackageWrapper =
    carrito?.addPackage ?? carrito?.agregarPaquete ?? null;
  const removePackageWrapper =
    carrito?.removePackage ?? carrito?.removerPaquete ?? null;

  const [mostrarModal, setMostrarModal] = useState(false);

  // Cálculo de precios (memoizado)
  const calc = useMemo(() => {
    const hotelSeasonDiscount = hotelData?.temporada?.porcentaje ?? 0;
    return calcPackageTotal({
      paquete,
      hotelSeasonDiscount,
      qty: 1,
    });
  }, [paquete, hotelData?.temporada?.porcentaje]);

  const {
    noches,
    final: precioFinal,
    original: precioOriginal,
  } = calc || {
    noches: paquete.noches ?? 0,
    final: paquete.precio ?? 0,
    original: paquete.precio ?? paquete.precio,
  };

  // Cálculo de descuento combinado para mostrar en UI
  const descPaquete = normalizeDiscount(paquete.descuento);
  const descTemporada = normalizeDiscount(hotelData?.temporada?.porcentaje);
  const totalDisc = 1 - (1 - descPaquete) * (1 - descTemporada);

  // Handlers: notificar padre y/o usar contexto
  const manejarSeleccion = useCallback(
    (e) => {
      const checked = Boolean(e.target.checked);

      // Notificar al padre para mantener UI controlada si provisto
      if (typeof onSelect === 'function') {
        onSelect(paquete.id);
      }

      // Si no hay onSelect, fallback a usar API del contexto directamente
      if (typeof onSelect !== 'function') {
        if (checked) {
          if (typeof addPackageWrapper === 'function') {
            // Si el wrapper es agregarPaquete (API antigua), acepta (hotelInfo, paquete)
            // Si es addPackage (wrapper nuevo), firma (hotelId, pkgObj)
            try {
              if (typeof carrito?.addPackage === 'function') {
                // wrapper nuevo: addPackage(hotelId, pkgObj)
                carrito.addPackage(resolvedHotelId, paquete);
              } else if (typeof carrito?.agregarPaquete === 'function') {
                // API antigua: agregarPaquete(hotelInfo, paquete)
                carrito.agregarPaquete(hotelInfo, paquete);
              } else {
                // si sólo tenemos el wrapper variable (fallback)
                addPackageWrapper(
                  resolvedHotelId ? resolvedHotelId : hotelInfo,
                  paquete
                );
              }
            } catch (err) {
              console.warn('Error agregando paquete:', err);
            }
          } else {
            console.warn(
              'PaqueteItem: no existe función para agregar paquete en CarritoContext'
            );
          }
        } else {
          if (typeof removePackageWrapper === 'function') {
            try {
              if (typeof carrito?.removePackage === 'function') {
                // wrapper nuevo: removePackage(hotelId, pkgId)
                carrito.removePackage(resolvedHotelId, paquete.id);
              } else if (typeof carrito?.removerPaquete === 'function') {
                // API antigua: removerPaquete(hotelId, paqueteId)
                carrito.removerPaquete(resolvedHotelId, paquete.id);
              } else {
                removePackageWrapper(
                  resolvedHotelId ? resolvedHotelId : hotelInfo,
                  paquete.id
                );
              }
            } catch (err) {
              console.warn('Error removiendo paquete:', err);
            }
          } else {
            console.warn(
              'PaqueteItem: no existe función para remover paquete en CarritoContext'
            );
          }
        }
      }
    },
    [
      onSelect,
      paquete,
      addPackageWrapper,
      removePackageWrapper,
      carrito,
      resolvedHotelId,
      hotelInfo,
    ]
  );

  const handleShowDetails = useCallback((e) => {
    e?.stopPropagation();
    setMostrarModal(true);
  }, []);

  const handleCloseModal = useCallback(() => setMostrarModal(false), []);

  const handleReserveFromModal = useCallback(() => {
    // Si padre controla selección, delegamos en onSelect; si no, usamos contexto directo
    if (typeof onSelect === 'function') {
      if (!isSelected) onSelect(paquete.id);
    } else {
      if (typeof addPackageWrapper === 'function') {
        try {
          if (typeof carrito?.addPackage === 'function') {
            carrito.addPackage(resolvedHotelId, paquete);
          } else if (typeof carrito?.agregarPaquete === 'function') {
            carrito.agregarPaquete(hotelInfo, paquete);
          } else {
            addPackageWrapper(
              resolvedHotelId ? resolvedHotelId : hotelInfo,
              paquete
            );
          }
        } catch (err) {
          console.warn('Error agregando paquete desde modal:', err);
        }
      } else {
        console.warn(
          'PaqueteItem: no existe función para agregar paquete en CarritoContext'
        );
      }
    }
    setMostrarModal(false);
  }, [
    onSelect,
    isSelected,
    addPackageWrapper,
    carrito,
    resolvedHotelId,
    paquete,
    hotelInfo,
  ]);

  return (
    <>
      <article className="grid grid-cols-3 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Columna 1: info del paquete (ocupa 2 espacios) */}
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
                <span>{noches}</span>
              </div>

              {totalDisc > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span>{(totalDisc * 100).toFixed(0)}%</span>
                </div>
              )}

              <button
                onClick={handleShowDetails}
                className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

        {/* Columna 3: precio */}
        <div className="flex justify-end">
          <div className="text-right">
            <PriceTag
              precio={precioFinal}
              original={
                precioFinal < precioOriginal ? precioOriginal : undefined
              }
            />
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
