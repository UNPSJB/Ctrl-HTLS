import { useState } from 'react';
import { Star, MapPin, AlignLeft, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@ui/Modal';

function HotelDetailsModal({ hotel, onClose }) {
  const [showAllServices, setShowAllServices] = useState(false);

  if (!hotel) return null;

  const estrellas = Number(hotel.estrellas) || 0;

  const categoria = hotel.categoria || {};
  const servicios = categoria?.servicios || [];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={hotel.nombre}
      description="Ficha Técnica y Operativa Comercial"
      onConfirm={onClose}
      confirmLabel="Cerrar Ficha"
    >
      <div className="flex flex-col gap-6">
        {/* Cabecera: Estrellas y Ubicación alineados a los extremos */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
          {hotel.ubicacion && (
            <address className="flex items-center gap-1.5 not-italic text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-right">
                {hotel.ubicacion.nombreCiudad}, {hotel.ubicacion.nombreProvincia}, {hotel.ubicacion.nombrePais}
              </span>
            </address>
          )}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: estrellas }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" />
            ))}
          </div>
        </div>

        {/* Fila 2: Narrativa de Descripción */}
        <div className="flex flex-col gap-3 w-full">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            <AlignLeft className="h-4 w-4 text-blue-500" /> Descripción
          </h3>
          <div className="overflow-y-auto max-h-60 pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
              {hotel.descripcion || "Este hotel no posee una descripción narrativa cargada en el sistema."}
            </p>
          </div>
        </div>

        {/* Zona Inferior: Servicios Operativos Expansibles */}
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            <Info className="h-4 w-4 text-blue-500" /> Servicios Operativos
          </h3>

          <div className="relative">
            <div
              className={`flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ease-in-out ${showAllServices ? 'max-h-[500px]' : 'max-h-[32px]'}`}
            >
              {servicios.length > 0 ? (
                servicios.map((srv, index) => (
                  <span key={index} className="flex h-8 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{typeof srv === 'string' ? srv : srv.nombre}</span>
                  </span>
                ))
              ) : (
                <span className="text-sm italic text-gray-500 dark:text-gray-500 flex h-8 items-center">
                  Consolidando servicios desde el servidor...
                </span>
              )}
            </div>

            {servicios.length > 3 && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {showAllServices ? (
                  <>Ocultar <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Ver todos los servicios <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default HotelDetailsModal;
