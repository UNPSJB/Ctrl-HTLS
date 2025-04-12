import HotelCard from '@ui/cards/HotelCard';
import hotelsData from '@/data/hotels.json';

const HotelList = ({ filters }) => {
  // Si no se han ingresado filtros, se muestra un mensaje inicial con estilos consistentes
  if (!filters) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">
          Ingrese datos para poder obtener hoteles.
        </p>
      </div>
    );
  }

  // Filtrado de hoteles basado en los filtros
  const filteredHotels = hotelsData.filter((hotel) => {
    // Filtro por nombre
    const matchName = filters.name
      ? hotel.nombre.toLowerCase().includes(filters.name.toLowerCase())
      : true;

    // Filtro por ubicación (se verifica en ciudad, provincia y país)
    const locationString =
      `${hotel.ubicacion.ciudad} ${hotel.ubicacion.provincia} ${hotel.ubicacion.pais}`.toLowerCase();
    const matchLocation = filters.location
      ? locationString.includes(filters.location.toLowerCase())
      : true;

    // Filtro por calificación (estrellas)
    const matchRating =
      filters.rating > 0 ? hotel.estrellas >= filters.rating : true;

    // Filtro por capacidad: se verifica si alguna habitación tiene capacidad mayor o igual
    const matchCapacity = filters.capacity
      ? hotel.habitaciones.some((room) => room.capacidad >= filters.capacity)
      : true;

    return matchName && matchLocation && matchRating && matchCapacity;
  });

  // Si no se encontraron hoteles, se muestra un mensaje con estilos similares
  if (filteredHotels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">
          No se encontraron hoteles con los datos seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {filteredHotels.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
