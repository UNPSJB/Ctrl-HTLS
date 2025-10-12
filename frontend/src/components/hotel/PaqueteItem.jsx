import { memo, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Percent, Info } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import Counter from '@ui/Counter';
import { calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@context/CarritoContext';
import useBookingDates from '@hooks/useBookingDates';

function PaqueteItem({ hotelData, paqueteGroup, onAdd, onRemove }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const { isoFechaInicio, isoFechaFin } = useBookingDates();
  const { carrito } = useCarrito();

  const { nombre, noches, descuento, descripcion, instancias } = paqueteGroup;
  const maxAvailable = instancias.length;

  const hotelEnCarrito = useMemo(() => {
    return carrito.hoteles.find((h) => h.hotelId === hotelData?.hotelId);
  }, [carrito.hoteles, hotelData?.hotelId]);

  const selectedCount = useMemo(() => {
    if (!hotelEnCarrito) return 0;
    const idsEnCarrito = new Set(hotelEnCarrito.paquetes.map((p) => p.id));
    return instancias.filter((inst) => idsEnCarrito.has(inst.id)).length;
  }, [hotelEnCarrito, instancias]);

  const { precioTemporada: precioBase, precioDescuento } = useMemo(() => {
    return calcPackageTotal({
      paquete: instancias[0],
      porcentaje: hotelData?.temporada?.porcentaje,
    });
  }, [instancias, hotelData?.temporada]);

  const handleIncrement = useCallback(() => {
    if (selectedCount >= maxAvailable || !onAdd) return;
    const idsEnCarrito = new Set(
      hotelEnCarrito?.paquetes.map((p) => p.id) || []
    );
    const instanciaParaAgregar = instancias.find(
      (inst) => !idsEnCarrito.has(inst.id)
    );

    if (instanciaParaAgregar) {
      const fechas = { fechaInicio: isoFechaInicio, fechaFin: isoFechaFin };
      onAdd(instanciaParaAgregar, fechas);
    }
  }, [
    selectedCount,
    maxAvailable,
    instancias,
    hotelEnCarrito,
    onAdd,
    isoFechaInicio,
    isoFechaFin,
  ]);

  const handleDecrement = useCallback(() => {
    if (selectedCount <= 0 || !onRemove) return;
    const idsEnCarrito = new Set(
      hotelEnCarrito?.paquetes.map((p) => p.id) || []
    );
    const instanciasSeleccionadas = instancias.filter((inst) =>
      idsEnCarrito.has(inst.id)
    );

    if (instanciasSeleccionadas.length > 0) {
      const idARemover =
        instanciasSeleccionadas[instanciasSeleccionadas.length - 1].id;
      onRemove(idARemover);
    }
  }, [selectedCount, onRemove, hotelEnCarrito, instancias]);

  const handleShowDetails = () => setMostrarModal(true);
  const handleCloseModal = () => setMostrarModal(false);
  const handleReserveFromModal = () => {
    handleIncrement();
    setMostrarModal(false);
  };

  return (
    <>
      <article className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* --- PRIMERA FILA --- */}
        <div className="grid grid-cols-4 items-center px-4 py-3">
          {/* Columna 1: Nombre y Detalles */}
          <div className="col-span-2 flex flex-col gap-2">
            {/* Sub-fila 1: Nombre */}
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {nombre}
            </div>
            {/* Sub-fila 2: Iconos de detalles */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{noches} noches</span>
              </div>
              {descuento > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <Percent className="h-4 w-4" />
                  <span>{(descuento * 100).toFixed(0)}%</span>
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
          </div>

          {/* Columna 2: Contador */}
          <div className="flex justify-center">
            <Counter
              value={selectedCount}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              max={maxAvailable}
            />
          </div>

          {/* Columna 3: Precio */}
          <div className="flex justify-end">
            <PriceTag precio={precioDescuento} original={precioBase} />
          </div>
        </div>

        {/* --- SEGUNDA FILA --- */}
        <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {descripcion}
          </p>
        </div>
      </article>

      {mostrarModal &&
        createPortal(
          <PaqueteDetailsModal
            paquete={instancias[0]}
            temporada={hotelData?.temporada}
            onClose={handleCloseModal}
            onReserve={handleReserveFromModal}
          />,
          document.body
        )}
    </>
  );
}

export default memo(PaqueteItem);
