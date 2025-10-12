import { useMemo } from 'react';
import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';
import CartEmpty from './CartEmpty';
import { calcRoomInstanceTotal, calcPackageTotal } from '@utils/pricingUtils';
import dateUtils from '@utils/dateUtils';

const { nightsBetween } = dateUtils;

function CartSummary() {
  const { carrito = { hoteles: [] }, totalElementos } = useCarrito();

  const isEmpty = Number(totalElementos ?? 0) === 0;

  // Calcular total global (usamos pricingUtils para mantener consistencia)
  const totalGlobal = useMemo(() => {
    let acum = 0;

    (carrito.hoteles || []).forEach((hotel) => {
      // habitaciones
      (hotel.habitaciones || []).forEach((room) => {
        // Determinar noches: si hay fechas, usamos nightsBetween; sino asumimos 1
        let nights = 1;
        try {
          const maybe = nightsBetween(room.fechaInicio, room.fechaFin, {
            useUTC: true,
          });
          nights =
            Number.isFinite(Number(maybe)) && Number(maybe) > 0
              ? Math.floor(Number(maybe))
              : 1;
        } catch (err) {
          nights = 1;
        }

        const qty = room.qty ?? 1;

        // calcRoomInstanceTotal espera roomInstance.price ; adaptamos
        const roomInstance = { ...room, price: room.precio ?? room.price ?? 0 };

        const { final: finalRoom = 0 } = calcRoomInstanceTotal({
          roomInstance,
          nights,
          qty,
          hotelSeasonDiscount: hotel?.temporada?.porcentaje ?? 0,
        });

        acum += finalRoom;
      });

      // paquetes
      (hotel.paquetes || []).forEach((pack) => {
        const qty = pack.qty ?? 1;
        const { final: finalPack = 0 } = calcPackageTotal({
          paquete: pack,
          qty,
          hotelSeasonDiscount: hotel?.temporada?.porcentaje ?? 0,
        });
        acum += finalPack;
      });
    });

    return acum;
  }, [carrito.hoteles]);

  return (
    <aside
      className="shadow-card sticky top-28 rounded-lg bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      aria-labelledby="cart-summary-title"
      role="complementary"
    >
      <CartHeader />

      <div className="mt-4 max-h-[65vh] space-y-4 overflow-auto">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          (carrito.hoteles || []).map((hotel) => (
            <HotelCartSection
              key={hotel.hotelId ?? hotel.nombre}
              hotel={hotel}
            />
          ))
        )}
      </div>

      <div className="mt-4">
        <CartFooter hotels={carrito?.hoteles ?? []} totalGlobal={totalGlobal} />
      </div>
    </aside>
  );
}

export default CartSummary;
