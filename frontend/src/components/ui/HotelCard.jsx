import { useState } from 'react';

const HotelCard = ({ hotel }) => {
  if (!hotel) return null; // Evita errores si no hay datos

  const [isExpanded, setIsExpanded] = useState(false); // Estado para expandir la tarjeta

  // Ruta de la imagen desde assets
  const imagePath = `/src/assets/${encodeURIComponent(hotel.nombre)}.webp`;

  // Función para mostrar estrellas como iconos (⭐)
  const renderStars = (count) => '⭐'.repeat(count);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isExpanded ? 'max-h-96' : 'max-h-56'
      }`}
      onClick={() => setIsExpanded(!isExpanded)} // Alternar expansión
    >
      {/* Contenedor principal */}
      <div className="flex">
        {/* Imagen del hotel - Siempre cuadrada */}
        <img
          className="w-48 h-48 object-cover"
          src={imagePath}
          alt={hotel.nombre}
        />

        {/* Información del hotel */}
        <div className="flex-1 p-4">
          <h2 className="text-xl font-bold text-gray-800">{hotel.nombre}</h2>
          <p className="text-yellow-500 text-sm">
            {renderStars(hotel.estrellas)}
          </p>
          <span className="text-gray-600 text-sm">
            📍 {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
            {hotel.ubicacion.pais}
          </span>
          <p className="text-gray-700 mt-2 text-sm">{hotel.descripcion}</p>
        </div>
      </div>

      {/* Sección expandible */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Primera fila: Habitaciones */}
          <div className="py-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Habitaciones
            </h3>
          </div>

          {/* Segunda fila: Paquete Turístico */}
          <div className="py-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Paquete Turístico
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
