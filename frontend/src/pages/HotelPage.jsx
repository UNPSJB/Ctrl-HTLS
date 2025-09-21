import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ArrowLeft, Bed, Package } from 'lucide-react';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '@components/hotel/HabitacionItem';
import PaqueteItem from '@components/hotel/PaqueteItem';
import Temporada from '@components/hotel/Temporada';
import ImageLoader from '@ui/ImageLoader';
import { useCarrito } from '@context/CarritoContext';
import hotelsData from '@/data/hotels.json';

function HotelPage() {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();

  // Buscar hotel en el JSON por hotelId
  const hotel = hotelsData.find((h) => h.hotelId === parseInt(hotelId));

  const { togglePackageSelection } = useHotelSelection(hotel);
  const { carrito } = useCarrito();

  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotel?.hotelId);

  // Datos normalizados del hotel
  const hotelData = useMemo(() => {
    if (!hotel) return null;

    return {
      idHotel: hotel.hotelId,
      nombre: hotel.nombre,
      descripcion: hotel.descripcion ?? null,
      coeficiente: hotel.temporada?.porcentaje
        ? Number(hotel.temporada.porcentaje)
        : 0,
      temporada: hotel.temporada?.tipo ?? null,
    };
  }, [hotel]);

  // Agrupar habitaciones por tipo
  const groupedRooms = useMemo(() => {
    if (!hotel?.habitaciones) return [];

    const groups = hotel.habitaciones;
    const result = [];

    groups.forEach((group) => {
      const typeKey = Object.keys(group).find((k) => k !== 'capacidad');
      if (!typeKey) return;

      const instances = Array.isArray(group[typeKey]) ? group[typeKey] : [];
      const capacidad = Number(group.capacidad) || null;

      result.push({
        tipo: typeKey,
        capacidad,
        instances,
      });
    });

    return result;
  }, [hotel?.habitaciones]);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">
              Hotel no encontrado
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              El hotel que buscas no existe o no está disponible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const estrellas = Number(hotel.estrellas) || 0;
  const coeficiente = hotel.temporada?.porcentaje
    ? Number(hotel.temporada.porcentaje)
    : 0;
  const esTemporadaAlta = hotel.temporada?.tipo === 'alta';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a los resultados
        </button>

        {/* Header del hotel */}
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="aspect-video w-full overflow-hidden">
            <ImageLoader
              name={hotel.nombre}
              folder="hoteles"
              cuadrado={false}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {hotel.nombre}
                </h1>

                {estrellas > 0 && (
                  <div
                    role="img"
                    aria-label={`${estrellas} estrellas`}
                    className="mb-3 flex items-center gap-2"
                  >
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {estrellas}
                    </span>
                    <Star
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                    />
                  </div>
                )}

                <address className="flex items-center gap-2 not-italic text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span>
                    {hotel.ubicacion.nombreCiudad},{' '}
                    {hotel.ubicacion.nombreProvincia},{' '}
                    {hotel.ubicacion.nombrePais}
                  </span>
                </address>
              </div>

              {esTemporadaAlta && (
                <div className="flex-shrink-0">
                  <Temporada porcentaje={coeficiente} />
                </div>
              )}
            </div>

            {hotel.descripcion && (
              <p className="text-gray-600 dark:text-gray-400">
                {hotel.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Habitaciones */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
              <Bed className="h-6 w-6" />
              Habitaciones Disponibles
            </h2>

            <ul className="space-y-3">
              {groupedRooms.map((group) => (
                <li key={`${hotel.hotelId}-${group.tipo}`}>
                  <HabitacionItem
                    hotelData={hotelData}
                    habitacionGroup={group}
                    hotelInCart={hotelInCart}
                  />
                </li>
              ))}
            </ul>
          </section>

          {/* Paquetes */}
          <section className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
              <Package className="h-6 w-6" />
              Paquetes Turísticos
            </h2>

            <ul className="space-y-3">
              {Array.isArray(hotel.paquetes) && hotel.paquetes.length > 0 ? (
                hotel.paquetes.map((paquete) => (
                  <li key={paquete.id}>
                    <PaqueteItem
                      hotelData={hotelData}
                      paquete={paquete}
                      isSelected={hotelInCart?.paquetes?.some(
                        (p) => p.id === paquete.id
                      )}
                      onSelect={togglePackageSelection}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">
                  No hay paquetes disponibles.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HotelPage;
