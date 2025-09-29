import { useState, useMemo } from 'react';
import { Calendar, Percent, Info } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { calcPackageTotal, normalizeDiscount } from '@utils/pricingUtils';

function PaqueteItem({ hotelData, paquete, isSelected, onSelect }) {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const carrito = useCarrito();
  const agregarPaquete = carrito?.agregarPaquete;
  const removerPaquete = carrito?.removerPaquete;

  const { filtros } = useBusqueda?.() ?? {};
  const { fechaInicio, fechaFin } = filtros ?? {};

  const manejarSeleccion = (e) => {
    const checked = Boolean(e.target.checked);
    // Notificar al padre (HotelCard) para mantener UI consistente
    if (typeof onSelect === 'function') onSelect(paquete.id);

    if (checked) {
      if (typeof agregarPaquete === 'function') {
        agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
      } else {
        console.warn('useCarrito no expone agregarPaquete');
      }
    } else {
      if (typeof removerPaquete === 'function') {
        removerPaquete(hotelData.hotelId, paquete.id);
      } else {
        console.warn('useCarrito no expone removerPaquete');
      }
    }
  };

  // --- Cálculo de precios del paquete SIMPLIFICADO ---
  // Se usa useMemo para optimizar el cálculo llamando a la función centralizada.
  const calc = useMemo(() => {
    const hotelSeasonDiscount = hotelData?.temporada?.porcentaje ?? 0;

    // calcPackageTotal devuelve los precios ya redondeados a ENTERO.
    return calcPackageTotal({
      paquete,
      hotelSeasonDiscount: hotelSeasonDiscount,
      qty: 1, // Se calcula para una unidad para mostrar el precio unitario
    });
  }, [paquete, hotelData.temporada?.porcentaje]);

  const { noches, final: precioFinal, original: precioOriginal } = calc;

  // Se calcula el descuento total combinado para mostrar el porcentaje correcto en la UI
  const descPaquete = normalizeDiscount(paquete.descuento);
  const descTemporada = normalizeDiscount(hotelData?.temporada?.porcentaje);
  const totalDisc = 1 - (1 - descPaquete) * (1 - descTemporada);

  const handleShowDetails = () => setMostrarModal(true);
  const handleCloseModal = () => setMostrarModal(false);

  const handleReserveFromModal = () => {
    if (!isSelected) {
      if (typeof agregarPaquete === 'function') {
        agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
      } else {
        console.warn('useCarrito no expone agregarPaquete');
      }
    }
    setMostrarModal(false);
  };

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
            {/* Primera fila: nombre + iconos */}
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {paquete.nombre}
              </div>

              {/* Noches con icono */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{noches}</span>
              </div>

              {/* Descuento con icono */}
              {totalDisc > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span>{(totalDisc * 100).toFixed(0)}%</span>
                </div>
              )}

              {/* Botón de detalles */}
              <button
                onClick={handleShowDetails}
                className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                type="button"
              >
                <Info className="h-4 w-4" />
                <span>Detalles</span>
              </button>
            </div>

            {/* Segunda fila: descripción */}
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

      {/* Modal de detalles */}
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

export default PaqueteItem;
