import { useState, useMemo } from 'react';
import HotelSearch from '@hotel/HotelSearch';
import HotelList from '@hotel/HotelList';
import CartSummary from '@cart/CartSummary';
import ReservaPendienteView from '@cart/ReservaPendienteView';
import { useDisponibilidadSearch } from '@vendor-hooks/useDisponibilidadSearch';
import { useCarrito } from '@vendor-context/CarritoContext';

const HomePage = () => {
  const { hoteles, isLoading, error, buscarDisponibilidad } = useDisponibilidadSearch();
  const { reservaConfirmada } = useCarrito();
  
  const [isEditing, setIsEditing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params) => {
    setIsEditing(false);
    setHasSearched(true);
    await buscarDisponibilidad(params);
  };

  const estaBloqueado = !!reservaConfirmada;
  // El modo compacto se activa si hay hoteles, si ya se ha buscado O si el sistema está bloqueado por una reserva activa
  const showCompact = (hasSearched || hoteles.length > 0 || estaBloqueado) && !isEditing;

  return (
    <div className={`flex flex-col transition-all duration-700 ${!showCompact ? 'flex-1 justify-center py-10' : 'gap-6 pt-0'}`}>
      <HotelSearch
        onSearch={handleSearch}
        onExpand={() => setIsEditing(true)}
        isLoading={isLoading}
        isDisabled={estaBloqueado}
        isCompact={showCompact}
      />
      
      {showCompact && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="lg:col-span-3">
            {estaBloqueado ? (
              <ReservaPendienteView />
            ) : (
              <HotelList
                hoteles={hoteles}
                isLoading={isLoading}
                error={error}
                hasSearched={hasSearched}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
};

// Icono simple para el placeholder
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default HomePage;
