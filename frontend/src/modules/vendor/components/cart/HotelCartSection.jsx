import Temporada from '@hotel/Temporada';
import Descuento from '@ui/Descuento';
import RoomCartItem from './RoomCartItem';
import PackageCartItem from './PackageCartItem';
import { useCarritoPrecios } from '@vendor-hooks/useCarritoPrecios';
import { capitalizeWords } from '@/utils/stringUtils';

// Sección agrupada por hotel dentro del carrito de compras
function HotelCartSection({ hotel = {}, isLocked = false }) {
  const temporadaTipo = hotel?.temporada?.tipo;
  const temporadaPorcentaje = hotel?.temporada?.porcentaje ?? 0;

  // Obtener info de descuento del hook centralizado
  const { porHotel } = useCarritoPrecios();
  const hotelBreakdown = porHotel[hotel.hotelId];
  const tieneDescuento = hotelBreakdown && hotelBreakdown.descuentoCantidad > 0;

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {capitalizeWords(hotel?.nombre)}
        </h3>

        {/* Descuentos agrupados */}
        {(tieneDescuento || temporadaTipo) && (
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {temporadaTipo && (
              <Temporada porcentaje={temporadaPorcentaje} tipo={temporadaTipo} />
            )}
            {tieneDescuento && (
              <Descuento
                descuento={{
                  porcentaje: hotelBreakdown.porcentajeDescCantidad,
                  cantidad_de_habitaciones: hotelBreakdown.cantidadHabs
                }}
              />
            )}
          </div>
        )}
      </div>

      {(hotel.habitaciones || []).map((room) => (
        <RoomCartItem
          key={room._cartId || room.id}
          room={room}
          hotel={hotel}
          isLocked={isLocked}
        />
      ))}

      {(hotel.paquetes || []).map((pack) => (
        <PackageCartItem
          key={pack._cartId || pack.id}
          pack={pack}
          hotel={hotel}
          isLocked={isLocked}
        />
      ))}
    </section>
  );
}

export default HotelCartSection;
