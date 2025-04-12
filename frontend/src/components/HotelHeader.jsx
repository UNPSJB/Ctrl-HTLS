import { Star, MapPin } from 'lucide-react';
import Temporada from './Temporada';
import ImageLoader from './ImageLoader';

const HotelHeader = ({ hotel, isExpanded, setIsExpanded }) => {
  return (
    <div
      className="flex cursor-pointer gap-4"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Imagen del hotel usando el componente reutilizable */}
      <ImageLoader name={hotel.nombre} folder="hoteles" />

      <div className="flex flex-col flex-1 py-2 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {hotel.nombre}
        </h2>

        {/* Muestra temporada si es alta */}
        {hotel.temporada === 'alta' && (
          <Temporada porcentaje={hotel.coeficiente} />
        )}

        {/* Estrellas del hotel */}
        <div className="flex gap-1">
          {Array.from({ length: hotel.estrellas }, (_, index) => (
            <Star
              key={index}
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
            />
          ))}
        </div>

        {/* Ubicación */}
        <p className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-1">
          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
          {hotel.ubicacion.pais}
        </p>

        {/* Descripción del hotel */}
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {hotel.descripcion}
        </p>
      </div>
    </div>
  );
};

export default HotelHeader;
