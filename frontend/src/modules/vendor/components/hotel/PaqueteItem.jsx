import { memo, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Info, Plus, Trash2 } from 'lucide-react';
import PaqueteDetailsModal from './PaqueteDetailsModal';
import PriceTag from '@ui/PriceTag';
import { calcPackageTotal } from '@utils/pricingUtils';
import { useCarrito } from '@vendor-context/CarritoContext';
import useBookingDates from '@vendor-hooks/useBookingDates';
import { capitalizeWords } from '@/utils/stringUtils';

// Elemento de lista para un paquete turístico dentro del detalle del hotel
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

  const { original: precioBase, final: precioDescuento } = useMemo(() => {
    return calcPackageTotal({
      paquete: instancias[0],
    });
  }, [instancias]);

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
    
    const backendIds = new Set(instancias.map((inst) => inst.id));
    const paquetesEnCarrito = (hotelEnCarrito?.paquetes || []).filter((p) => 
      backendIds.has(p.id)
    );

    if (paquetesEnCarrito.length > 0) {
      const cartIdARemover = paquetesEnCarrito[paquetesEnCarrito.length - 1]._cartId;
      onRemove(cartIdARemover);
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
      <article className="flex flex-col rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800/60 dark:bg-gray-900/40">
        <div className="grid grid-cols-4 items-center px-4 py-3">
          <div className="col-span-2 flex flex-col gap-2">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {capitalizeWords(nombre)}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{noches} noches</span>
              </div>
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

          <div className="flex justify-center">
            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={handleDecrement}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleIncrement}
                disabled={maxAvailable <= 0}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            )}
          </div>

          <div className="flex justify-end">
            <PriceTag precio={precioDescuento} />
          </div>
        </div>

      </article>

      {mostrarModal &&
        createPortal(
          <PaqueteDetailsModal
            paquete={instancias[0]}
            onClose={handleCloseModal}
            onReserve={handleReserveFromModal}
          />,
          document.body
        )}
    </>
  );
}

export default memo(PaqueteItem);
