import { ImageOff, Star, Tag, MapPin } from 'lucide-react';
import Temporada from './Temporada';

const HotelHeader = ({
  hotel,
  isExpanded,
  setIsExpanded,
  imageError,
  setImageError,
}) => {
  const imagePath = `/src/assets/hoteles/${encodeURIComponent(hotel.nombre)}.webp`;

  return (
    <div
      className="flex cursor-pointer gap-4"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {imageError ? (
        <div className="w-52 h-52 flex items-center justify-center bg-gray-200 dark:bg-gray-700 ">
          <ImageOff className="w-12 h-12 text-gray-500" />
        </div>
      ) : (
        <img
          className="w-52 h-52 object-cover "
          src={imagePath}
          alt={hotel.nombre}
          onError={() => setImageError(true)}
        />
      )}

      <div className="flex flex-col flex-1 py-2 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {hotel.nombre}
        </h2>

        {hotel.temporada === 'alta' && (
          <Temporada porcentaje={hotel.coeficiente} />
        )}

        <div className="flex gap-1">
          {Array.from({ length: hotel.estrellas }, (_, index) => (
            <Star
              key={index}
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
            />
          ))}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-1">
          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {hotel.ubicacion.ciudad}, {hotel.ubicacion.provincia},{' '}
          {hotel.ubicacion.pais}
        </p>

        <p className=" text-gray-600 dark:text-gray-400 line-clamp-2">
          {hotel.descripcion}
        </p>
      </div>
    </div>
  );
};

export default HotelHeader;
