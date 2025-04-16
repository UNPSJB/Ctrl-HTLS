import { useState } from 'react';
import PaqueteDetailsModal from '../modals/PaqueteDetailsModal';
import PriceTag from '@components/PriceTag';
import { useCarrito } from '../../context/CarritoContext';
import { useBusqueda } from '../../context/BusquedaContext';

const PaqueteItem = ({
  idHotel,
  paquete,
  coeficiente,
  temporada,
  isSelected,
  onSelect,
}) => {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarPaquete, removerPaquete } = useCarrito();
  // Obtenemos los filtros utilizando el hook personalizado
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros;

  // Maneja la selección mediante el checkbox
  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(paquete.id);
    if (checked) {
      agregarPaquete(
        idHotel,
        paquete,
        fechaInicio,
        fechaFin,
        temporada,
        coeficiente
      );
    } else {
      removerPaquete(idHotel, paquete.id);
    }
  };

  // Se calcula el precio base (la lógica puede variar según tus requerimientos)
  const precioBase =
    paquete.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
    (1 - paquete.descuento / 100) *
    paquete.noches;

  return (
    <>
      <div
        className="grid items-center border rounded-md px-6 py-4 bg-gray-50 dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 gap-10"
        style={{ gridTemplateColumns: '1fr auto auto' }}
      >
        {/* Columna 1: Checkbox + Info del paquete */}
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

        {/* Columna 3: Precio y botón de detalles */}
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
            if (!isSelected) {
              agregarPaquete(idHotel, {
                id: paquete.id,
                nombre: paquete.nombre,
                descuento: paquete.descuento,
                noches: paquete.noches,
                fechaInicio,
                fechaFin,
              });
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default PaqueteItem;
