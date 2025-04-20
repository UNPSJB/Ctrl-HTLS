// PaqueteItem.jsx
import { useState } from 'react';
import PaqueteDetailsModal from '../modals/PaqueteDetailsModal';
import PriceTag from '@components/PriceTag';
import { useCarrito } from '../../context/CarritoContext';
import { useBusqueda } from '../../context/BusquedaContext';

const PaqueteItem = ({ hotelData, paquete, isSelected, onSelect }) => {
  if (!paquete) return null;

  const [mostrarModal, setMostrarModal] = useState(false);
  const { agregarPaquete, removerPaquete } = useCarrito();
  const { filtros } = useBusqueda();
  const { fechaInicio, fechaFin } = filtros;

  const manejarSeleccion = (e) => {
    const checked = e.target.checked;
    onSelect(paquete.id);
    if (checked) {
      agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
    } else {
      removerPaquete(hotelData.idHotel, paquete.id);
    }
  };

  // Cálculo del precio total con descuento y noches
  const precioBase =
    paquete.habitaciones.reduce((acum, hab) => acum + hab.precio, 0) *
    (1 - paquete.descuento / 100) *
    paquete.noches;

  return (
    <>
      <article
        aria-labelledby={`package-${paquete.id}-title`}
        className="grid items-center border rounded-md px-6 py-4 bg-gray-50 dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 gap-10"
        style={{ gridTemplateColumns: '1fr auto auto' }}
      >
        {/* Encabezado: checkbox + información básica */}
        <header className="flex items-center gap-6">
          <input
            type="checkbox"
            id={`package-${paquete.id}-checkbox`}
            checked={isSelected}
            onChange={manejarSeleccion}
            className="mt-1 w-5 h-5 cursor-pointer"
            aria-labelledby={`package-${paquete.id}-title`}
          />
          <div className="flex flex-col gap-1">
            <h4
              id={`package-${paquete.id}-title`}
              className="text-md font-semibold text-gray-800 dark:text-gray-200"
            >
              {paquete.nombre}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {paquete.descripcion}
            </p>
          </div>
        </header>

        {/* Sección: contador */}
        <section className="flex justify-center">
          {/* Aquí puedes insertar tu componente reutilizable de contador */}
          {/* <Counter max={paquete.habitaciones.length} /> */}
        </section>

        {/* Pie: precio y botón de detalles */}
        <footer className="flex flex-col items-end gap-1">
          <PriceTag precio={precioBase} coeficiente={hotelData.coeficiente} />
          <button
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            onClick={() => setMostrarModal(true)}
          >
            Más Detalles
          </button>
        </footer>
      </article>

      {mostrarModal && (
        <PaqueteDetailsModal
          paquete={paquete}
          coeficiente={hotelData.coeficiente}
          onClose={() => setMostrarModal(false)}
          onReserve={() => {
            if (!isSelected) {
              agregarPaquete(hotelData, paquete, { fechaInicio, fechaFin });
            }
            setMostrarModal(false);
          }}
        />
      )}
    </>
  );
};

export default PaqueteItem;
