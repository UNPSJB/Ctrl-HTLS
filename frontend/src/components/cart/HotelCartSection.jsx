import Temporada from '@components/hotel/Temporada';
import RoomCartItem from './RoomCartItem';
import PackageCartItem from './PackageCartItem';

function HotelCartSection({ hotel = {} }) {
  return (
    <section className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
          {hotel.nombre}
          {hotel.temporada === 'alta' && (
            <Temporada porcentaje={hotel.coeficiente} />
          )}
        </h3>
      </div>

      {/* Habitaciones */}
      {(hotel.habitaciones || []).map((room) => (
        <RoomCartItem key={room.id} room={room} hotel={hotel} />
      ))}

      {/* Paquetes */}
      {(hotel.paquetes || []).map((pack) => (
        <PackageCartItem key={pack.id} pack={pack} hotel={hotel} />
      ))}
    </section>
  );
}

export default HotelCartSection;
