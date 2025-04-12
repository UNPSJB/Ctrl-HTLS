import { useState } from 'react';
import PaqueteDetailsModal from '../PaqueteDetailsModal';
import PriceTag from '../PriceTag';
import { useCarrito } from '../../context/CartContext';

const PaqueteItem = ({
  idHotel,
  paquete,
  coeficiente,
  temporada,
  coeficienteHotel,
  isSelected,
  onSelect,
}) => {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarPaquete, removerPaquete } = useCarrito();

  // Cálculo del precio base del paquete
  const precioBase =
    paquete.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
    (1 - paquete.descuento / 100) *
    paquete.noches;

  const manejarSeleccion = () => {
    onSelect(paquete.id);
    if (isSelected) {
      removerPaquete(idHotel, paquete.id);
    } else {
      agregarPaquete(idHotel, paquete.id, temporada, coeficienteHotel);
    }
  };

  return (
    <>
      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900 shadow-sm flex items-center gap-4 border-gray-200 dark:border-gray-700">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={manejarSeleccion}
          className="w-5 h-5 cursor-pointer"
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
          <PriceTag precio={precioBase} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mt-2"
            onClick={() => setMostrarModal(true)}
          >
            Más Detalles
          </button>
        </div>
      </div>

      {mostrarModal && (
        <PaqueteDetailsModal
          paquete={paquete}
          coeficiente={coeficiente}
          onClose={() => setMostrarModal(false)}
          onReserve={() => {
            manejarSeleccion();
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default PaqueteItem;
