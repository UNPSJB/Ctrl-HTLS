import { useState } from 'react';
import PaqueteDetailsModal from '../PaqueteDetailsModal';
import PriceTag from '../PriceTag';

const PaqueteItem = ({ paquete, coeficiente, isSelected, onSelect }) => {
  if (!paquete) return null;

  const [showModal, setShowModal] = useState(false);

  // Calcula el precio base del paquete considerando:
  // - Suma de los precios de las habitaciones
  // - Descuento propio del paquete (paquete.descuento)
  // - Número de noches (paquete.noches)
  const packagePrice =
    paquete.habitaciones.reduce((acc, hab) => acc + hab.precio, 0) *
    (1 - paquete.descuento / 100) *
    paquete.noches;

  return (
    <>
      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(paquete.nombre)}
          className="w-5 h-5"
        />
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {paquete.nombre}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {paquete.descripcion}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <PriceTag precio={packagePrice} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2"
            onClick={() => setShowModal(true)}
          >
            Más Detalles
          </button>
        </div>
      </div>

      {showModal && (
        <PaqueteDetailsModal
          paquete={paquete}
          coeficiente={coeficiente}
          onClose={() => setShowModal(false)}
          onReserve={() => {
            onSelect(paquete.nombre); // Selecciona el paquete al reservar
            setShowModal(false); // Cierra el modal después de seleccionar
          }}
        />
      )}
    </>
  );
};

export default PaqueteItem;
