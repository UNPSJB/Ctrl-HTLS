import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import { BusquedaProvider } from '@context/BusquedaContext';

const HomePage = () => {
  return (
    <BusquedaProvider>
      <div className="container flex flex-col gap-10">
        {/* Componente de búsqueda que actualiza el contexto */}
        <HotelSearch />
        {/* Componente de listado que, por ahora, muestra todos los hoteles */}
        <HotelList />
      </div>
    </BusquedaProvider>
  );
};

export default HomePage;
