import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import { BusquedaProvider } from '@context/BusquedaContext';
import CartSummary from '@cart/CartSummary';
import { useDisponibilidadSearch } from '@/hooks/useDisponibilidadSearch';

const HomePage = () => {
  const { hoteles, isLoading, error, buscarDisponibilidad } =
    useDisponibilidadSearch();

  return (
    <BusquedaProvider>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Le pasamos la función para buscar y el estado de carga */}
          <HotelSearch onSearch={buscarDisponibilidad} isLoading={isLoading} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {/* Le pasamos los resultados de la búsqueda al componente de la lista */}
              <HotelList
                hoteles={hoteles}
                isLoading={isLoading}
                error={error}
              />
            </div>
            <div className="lg:col-span-2">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </BusquedaProvider>
  );
};

export default HomePage;
