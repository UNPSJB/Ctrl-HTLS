import { Star, MapPin } from 'lucide-react';
import Temporada from './Temporada';
import ImageLoader from '@ui/ImageLoader';

const HotelHeader = ({ hotel, isExpanded, setIsExpanded }) => {
  // Extraer datos directamente del objeto hotel original
  const estrellas = Number(hotel.estrellas) || 0;

  // Obtener coeficiente de temporada
  const coeficiente =
    typeof hotel.coeficiente === 'number'
      ? hotel.coeficiente
      : hotel.temporada?.porcentaje
        ? Number(hotel.temporada.porcentaje)
        : 0;

  // Verificar si es temporada alta
  const esTemporadaAlta = hotel.temporada?.tipo === 'alta';

  return (
    <header
      className="flex cursor-pointer gap-4"
      onClick={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
    >
      <figure className="overflow-hidden rounded-md">
        <ImageLoader name={hotel.nombre} folder="hoteles" cuadrado={true} />
        <figcaption className="sr-only">
          Imagen del hotel {hotel.nombre}
        </figcaption>
      </figure>

      <div className="flex flex-1 flex-col gap-3 py-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {hotel.nombre}
        </h2>

        {esTemporadaAlta && <Temporada porcentaje={coeficiente} />}

        {estrellas > 0 && (
          <div
            role="img"
            aria-label={`${estrellas} estrellas`}
            className="flex gap-1"
          >
            {Array.from({ length: estrellas }, (_, i) => (
              <Star
                key={i}
                className="h-5 w-5 text-yellow-500"
                fill="currentColor"
              />
            ))}
          </div>
        )}

        <address className="flex items-center gap-1 not-italic text-gray-600 dark:text-gray-400">
          <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          {hotel.ubicacion?.nombreCiudad ?? hotel.ubicacion?.ciudad},{' '}
          {hotel.ubicacion?.nombreProvincia ?? hotel.ubicacion?.provincia},{' '}
          {hotel.ubicacion?.nombrePais ?? hotel.ubicacion?.pais}
        </address>

        {hotel.descripcion && (
          <p className="line-clamp-2 text-gray-600 dark:text-gray-400">
            {hotel.descripcion}
          </p>
        )}
      </div>
    </header>
  );
};

export default HotelHeader;
