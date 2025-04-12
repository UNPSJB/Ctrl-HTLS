import { useState, useEffect } from 'react';
import PaqueteDetailsModal from '../modals/PaqueteDetailsModal';
import Contador from '../ui/Contador';
import PriceTag from '../PriceTag';
import { useCarrito } from '../../context/CarritoContext';

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
  const [cantidad, setCantidad] = useState(0);
  const { agregarPaquete, removerPaquete } = useCarrito();

  useEffect(() => {
    if (!isSelected) setCantidad(0);
  }, [isSelected]);

  const manejarSeleccion = () => {
    onSelect(paquete.id);
    if (isSelected) {
      removerPaquete(idHotel, paquete.id);
      setCantidad(0);
    } else {
      agregarPaquete(idHotel, paquete.id, temporada, coeficienteHotel);
      setCantidad(1);
    }
  };

  const precioBase =
    paquete.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
    (1 - paquete.descuento / 100) *
    paquete.noches;

  return (
    <>
      <div
        className="grid items-center border rounded-md px-6 py-4 bg-gray-50 dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 gap-10"
        style={{
          gridTemplateColumns: '1fr auto auto',
        }}
      >
        {/* Columna 1: Checkbox + Info paquete */}
        <div className="flex items-center gap-6">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={manejarSeleccion}
            className="mt-1 w-5 h-5 cursor-pointer"
          />
          <div className="flex flex-col gap-1">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
              {paquete.nombre}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {paquete.descripcion}
            </p>
          </div>
        </div>

        {/* Columna 2: Contador */}
        <Contador
          initial={cantidad}
          max={5}
          onChange={(nuevaCantidad) => {
            setCantidad(nuevaCantidad);
            if (nuevaCantidad === 0) {
              manejarSeleccion();
            } else {
              if (!isSelected) manejarSeleccion();
              // lógica para agregar o quitar del carrito si ya estaba seleccionado
            }
          }}
        />

        {/* Columna 3: Precio + Detalles */}
        <div className="flex flex-col items-end gap-1">
          <PriceTag precio={precioBase} coeficiente={coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
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
