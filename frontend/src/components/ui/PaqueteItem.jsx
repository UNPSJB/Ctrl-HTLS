import { useState, useEffect } from 'react';
import PaqueteDetailsModal from '../modals/PaqueteDetailsModal';
import Contador from '@ui/Contador';
import PriceTag from '@components/PriceTag';
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

  // Si se deselecciona el paquete, reiniciamos la cantidad
  useEffect(() => {
    if (!isSelected) setCantidad(0);
  }, [isSelected]);

  // Función para manejar la selección a través del checkbox
  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(paquete.id);
    if (checked) {
      // Si se marca el checkbox, se agrega el paquete al contexto y se establece la cantidad en 1
      agregarPaquete(idHotel, paquete.id, temporada, coeficienteHotel);
      setCantidad(1);
    } else {
      // Si se desmarca, se remueve el paquete del contexto y se reinicia la cantidad
      removerPaquete(idHotel, paquete.id);
      setCantidad(0);
    }
  };

  // Calcular el precio base del paquete según las habitaciones, descuento y noches
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
            if (nuevaCantidad === 0 && isSelected) {
              // Si el contador llega a 0 y el paquete estaba seleccionado, se remueve del contexto
              removerPaquete(idHotel, paquete.id);
            } else if (nuevaCantidad > 0 && !isSelected) {
              // Si se incrementa la cantidad y el paquete no está seleccionado, se agrega al contexto
              agregarPaquete(idHotel, paquete.id, temporada, coeficienteHotel);
            }
            // Puedes extender la lógica para actualizar la cantidad en el contexto si es necesario
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
            // Al reservar desde el modal se asegura la selección
            if (!isSelected) {
              agregarPaquete(idHotel, paquete.id, temporada, coeficienteHotel);
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default PaqueteItem;
