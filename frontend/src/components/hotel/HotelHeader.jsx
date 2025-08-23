// HotelHeader.jsx
import { Star, MapPin } from 'lucide-react';
import Temporada from './Temporada';
import ImageLoader from '@ui/ImageLoader';

const HotelHeader = ({ hotel, isExpanded, setIsExpanded }) => {
  return (
    <header
      className="flex cursor-pointer gap-4"
      onClick={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
    >
      {/* Imagen del hotel: ImageLoader controla w-52/h-52 */}
      <figure className="overflow-hidden rounded-md">
        <ImageLoader name={hotel.nombre} folder="hoteles" cuadrado={true} />
        <figcaption className="sr-only">
          Imagen del hotel {hotel.nombre}
        </figcaption>
      </figure>

      {/* Información textual */}
      <div className="flex flex-col flex-1 py-2 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {hotel.nombre}
        </h2>

        {hotel.temporada === 'alta' && (
          <Temporada porcentaje={hotel.coeficiente} />
        )}

        <div
          role="img"
          aria-label={`${hotel.estrellas} estrellas`}
          className="flex gap-1"
        >
          {Array.from({ length: hotel.estrellas }, (_, i) => (
            <Star
              key={i}
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
            />
          ))}
        </div>

        <address className="not-italic text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
          {hotel.ubicacion.pais}
        </address>

        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {hotel.descripcion}
        </p>
      </div>
    </header>
  );
};

export default HotelHeader;
