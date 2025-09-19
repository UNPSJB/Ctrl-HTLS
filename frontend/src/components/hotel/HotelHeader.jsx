import { Star, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Temporada from './Temporada';
import ImageLoader from '@ui/ImageLoader';

const HotelHeader = ({ hotel, isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();

  // Extraer datos directamente del objeto hotel original
  const estrellas = Number(hotel.estrellas) || 0;
  const hotelId = hotel.hotelId ?? hotel.id;

  // Obtener coeficiente de temporada
  const coeficiente =
    typeof hotel.coeficiente === 'number'
      ? hotel.coeficiente
      : hotel.temporada?.porcentaje
        ? Number(hotel.temporada.porcentaje)
        : 0;

  // Verificar si es temporada alta
  const esTemporadaAlta = hotel.temporada?.tipo === 'alta';

  // Función para manejar la redirección al hotel
  const handleHotelRedirect = (e) => {
    e.stopPropagation(); // Evitar que se ejecute el toggle de expansión
    navigate(`/hotel/${hotelId}`);
  };

  return (
    <header
      className="flex cursor-pointer gap-4"
      onClick={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
    >
      <figure className="overflow-hidden">
        <ImageLoader name={hotel.nombre} folder="hoteles" cuadrado={true} />
        <figcaption className="sr-only">
          Imagen del hotel {hotel.nombre}
        </figcaption>
      </figure>

      <div className="flex flex-1 flex-col gap-3 py-2 pr-4">
        <div className="flex items-center justify-between">
          <div
            className="group flex cursor-pointer items-center gap-2"
            onClick={handleHotelRedirect}
            title={`Ver detalles de ${hotel.nombre}`}
          >
            <h2 className="text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
              {hotel.nombre}
            </h2>
            <ExternalLink className="h-5 w-5 text-gray-500 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
          </div>

          {estrellas > 0 && (
            <div
              role="img"
              aria-label={`${estrellas} estrellas`}
              className="flex items-center gap-1"
            >
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {estrellas}
              </span>
              <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
            </div>
          )}
        </div>

        {esTemporadaAlta && <Temporada porcentaje={coeficiente} />}

        <address className="flex items-center gap-1 not-italic text-gray-600 dark:text-gray-400">
          <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          {hotel.ubicacion?.nombreCiudad ?? hotel.ubicacion?.ciudad},{' '}
          {hotel.ubicacion?.nombreProvincia ?? hotel.ubicacion?.provincia},{' '}
          {hotel.ubicacion?.nombrePais ?? hotel.ubicacion?.pais}
        </address>

        {hotel.descripcion && (
          <p className="line-clamp-3 text-gray-600 dark:text-gray-400">
            {hotel.descripcion}
          </p>
        )}
      </div>
    </header>
  );
};

export default HotelHeader;
