import { useState } from 'react';
import { Calendar, Percent, Info } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import { useCarrito } from '@context/CarritoContext';
import { useBusqueda } from '@context/BusquedaContext';
import { calcularNoches, normalizarDescuento } from '@utils/pricingUtils';

const PaqueteItem = ({ hotelData, paquete, isSelected, onSelect }) => {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarPaquete, removerPaquete } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros;

  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(paquete.id); // compat
    if (checked) {
      agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
    } else {
      removerPaquete(hotelData.idHotel, paquete.id);
    }
  };

  // --- Cálculo de precios del paquete ---
  const noches =
    typeof paquete.noches === 'number'
      ? Math.max(1, Math.floor(paquete.noches))
      : calcularNoches(paquete.fechaInicio, paquete.fechaFin);

  const sumaPorNoche = (paquete.habitaciones || []).reduce(
    (sum, h) => sum + Number(h.precio || 0),
    0
  );

  const precioOriginal = Math.round(sumaPorNoche * noches * 100) / 100;

  const descPaquete = normalizarDescuento(paquete.descuento);
  const despuesPaquete =
    Math.round(precioOriginal * (1 - descPaquete) * 100) / 100;

  const esAlta = hotelData?.temporada === 'alta';
  const descHotel = esAlta ? normalizarDescuento(hotelData?.coeficiente) : 0;

  const precioFinal = Math.round(despuesPaquete * (1 - descHotel) * 100) / 100;

  const handleShowDetails = () => {
    setMostrarModal(true);
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
  };

  const handleReserveFromModal = () => {
    if (!isSelected) {
      agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
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
            checked={isSelected}
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
              {paquete.descuento && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span>{paquete.descuento}%</span>
                </div>
              )}

              {/* Botón de detalles */}
              <button
                onClick={handleShowDetails}
                className="flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
          coeficiente={hotelData.coeficiente}
          onClose={handleCloseModal}
          onReserve={handleReserveFromModal}
        />
      )}
    </>
  );
};

export default PaqueteItem;
