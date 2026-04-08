import { useMemo } from 'react';
import { Percent } from 'lucide-react';
import Temporada from '@hotel/Temporada';
import RoomCartItem from './RoomCartItem';
import PackageCartItem from './PackageCartItem';
import { calcRoomInstanceTotal, calcDescuentoPorCantidad } from '@utils/pricingUtils';

// Sección agrupada por hotel dentro del carrito de compras
function HotelCartSection({ hotel = {}, isLocked = false }) {
  const temporadaTipo = hotel?.temporada?.tipo;
  const temporadaPorcentaje = hotel?.temporada?.porcentaje ?? 0;

  // Calcular si aplica descuento por cantidad exacta
  const descuentoInfo = useMemo(() => {
    const cantidadHabs = (hotel.habitaciones || []).length;
    if (cantidadHabs === 0) return null;

    let totalHabsConTemporada = 0;
    (hotel.habitaciones || []).forEach((room) => {
      const calc = calcRoomInstanceTotal({
        precio: room.precio,
        temporada: hotel?.temporada,
        alquiler: { fechaInicio: room.fechaInicio, fechaFin: room.fechaFin },
      });
      totalHabsConTemporada += calc.final;
    });

    const result = calcDescuentoPorCantidad(
      cantidadHabs,
      hotel.descuentos,
      totalHabsConTemporada
    );

    return result.montoDescuento > 0 ? result : null;
  }, [hotel]);

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          {hotel.nombre}
          {temporadaTipo && <Temporada porcentaje={temporadaPorcentaje} tipo={temporadaTipo} />}
        </h3>

        {/* Indicador de descuento por cantidad */}
        {descuentoInfo && (
          <div className="mt-2 flex items-center gap-2">
            <Percent className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(descuentoInfo.porcentajeAplicado * 100)}% descuento por {(hotel.habitaciones || []).length} habitaciones (-${descuentoInfo.montoDescuento})
            </span>
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
