import { MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Temporada from './Temporada';
import Calificacion from './Calificacion';

// Fila compacta de hotel para visualización tipo CRM
const HotelHeader = ({ hotel, isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();

  const handleHotelRedirect = (e) => {
    e.stopPropagation();
    // Por petición actual del usuario, el HotelPage está omitido,
    // pero mantenemos el enlace por si hiciera falta luego.
    navigate(`/hotel/${hotel.hotelId}`);
  };

  return (
    <header
      className={`flex flex-col cursor-pointer transition-colors p-5 ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/80'}`}
      onClick={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Lado Izquierdo: Titulo y Estrellas */}
        <div className="flex items-center gap-4 flex-1">
          <div
            className="group flex cursor-pointer items-center gap-2"
            onClick={handleHotelRedirect}
            title={`Ver detalles de ${hotel.nombre}`}
          >
            <h2 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {hotel.nombre}
            </h2>
            <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          <div className="hidden sm:block">
            <Calificacion estrellas={hotel.categoria.estrellas} />
          </div>
        </div>

        {/* Lado Central: Ubicacion rapida */}
        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1.5 flex-none">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate max-w-[200px]">
            {hotel.ubicacion?.nombreCiudad ?? hotel.ubicacion?.ciudad},{' '}
            {hotel.ubicacion?.nombreProvincia ?? hotel.ubicacion?.provincia}
          </span>
        </div>

        {/* Lado Derecho: Indicadores y Expansion */}
        <div className="flex items-center gap-4 flex-none">
          {hotel.temporada?.tipo === 'alta' && (
            <div className="transform scale-90">
               <Temporada porcentaje={hotel.temporada.porcentaje} />
            </div>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* Descripcion Inferior solo visible si hay (limitada) */}
      {hotel.descripcion && !isExpanded && (
        <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
          {hotel.descripcion}
        </p>
      )}
    </header>
  );
};

export default HotelHeader;

