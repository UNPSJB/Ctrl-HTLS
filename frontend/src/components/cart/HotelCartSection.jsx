import Temporada from '@components/hotel/Temporada';
import RoomCartItem from './RoomCartItem';
import PackageCartItem from './PackageCartItem';

function HotelCartSection({ hotel = {}, isLocked = false }) {
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
