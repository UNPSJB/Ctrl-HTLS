// HotelCartSection.jsx
import Temporada from '@components/hotel/Temporada';
import RoomCartItem from './RoomCartItem';
import PackageCartItem from './PackageCartItem';

/**
 * HotelCartSection
 * - Recibe la entrada del hotel que viene del carrito (ya contiene habitaciones/paquetes).
 * - Renderiza ambas secciones con los componentes específicos.
 */
function HotelCartSection({ hotel = {} }) {
  const temporadaTipo = hotel?.temporada?.tipo;
  const temporadaPorcentaje = hotel?.temporada?.porcentaje ?? 0;

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          {hotel.nombre}
          {temporadaTipo && <Temporada porcentaje={temporadaPorcentaje} />}
        </h3>
      </div>

      {(hotel.habitaciones || []).map((room) => (
        <RoomCartItem key={room.id} room={room} hotel={hotel} />
      ))}

      {(hotel.paquetes || []).map((pack) => (
        <PackageCartItem key={pack.id} pack={pack} hotel={hotel} />
      ))}
    </section>
  );
}

export default HotelCartSection;
