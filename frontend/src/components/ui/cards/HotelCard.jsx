import { useState, useMemo } from 'react';
import { Bed, Package, Percent } from 'lucide-react';
import useHotelSelection from '@hooks/useHotelSelection';
import HabitacionItem from '../../hotel/HabitacionItem';
import PaqueteItem from '../../hotel/PaqueteItem';
import HotelHeader from '@components/hotel/HotelHeader';
import { useCarrito } from '@context/CarritoContext';

function HotelCard({ hotel }) {
  if (!hotel) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const { togglePackageSelection } = useHotelSelection(hotel);
  const { carrito } = useCarrito();

  const hotelInCart = carrito.hoteles.find((h) => h.hotelId === hotel.hotelId);

  // hotelData que se pasa a child components (normalizado)
  const hotelData = {
    hotelId: hotel.hotelId,
    nombre: hotel.nombre,
    temporada: hotel.temporada,
  };

  // Agrupar habitaciones por tipo usando useMemo (mejora rendimiento)
  const groupedRooms = useMemo(() => {
    if (!Array.isArray(hotel.habitaciones)) return [];

    const result = [];

    hotel.habitaciones.forEach((group) => {
      // cada group tiene una clave que es el tipo (ej: "Deluxe"), precio y capacidad
      const typeKey = Object.keys(group).find(
        (k) => !['precio', 'capacidad'].includes(k)
      );
      if (!typeKey) {
        console.warn(
          `Grupo sin clave esperada en hotel ${hotel.hotelId}`,
          group
        );
        return;
      }

      const instances = Array.isArray(group[typeKey]) ? group[typeKey] : [];
      const precio = Number(group.precio) || 0;
      const capacidad = Number(group.capacidad) || 0;

      result.push({
        tipo: typeKey,
        precio,
        capacidad,
        instances,
      });
    });

    return result;
  }, [hotel.habitaciones, hotel.hotelId]);

  // Formatear descuentos para mostrar
  const formatearDescuentos = useMemo(() => {
    if (!Array.isArray(hotel.descuentos) || hotel.descuentos.length === 0) {
      return null;
    }

    return hotel.descuentos.map((descuento) => {
      const porcentaje = Math.round(Number(descuento.porcentaje) * 100);
      return {
        id: descuento.id,
        porcentaje,
        cantidad: descuento.cantidad_de_habitaciones,
        texto: `${porcentaje}% OFF en ${descuento.cantidad_de_habitaciones}+ habitaciones`,
      };
    });
  }, [hotel.descuentos]);

  return (
    <article className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:hover:from-gray-800 dark:hover:to-blue-900/20">
      <HotelHeader
        hotel={hotel}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {isExpanded && (
        <>
          <section
            aria-labelledby={`rooms-${hotel.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3
                id={`rooms-${hotel.hotelId}-title`}
                className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                <Bed className="h-5 w-5" />
                Habitaciones Disponibles
              </h3>

              {/* Mostrar descuentos por cantidad */}
              {formatearDescuentos &&
                formatearDescuentos.map((descuento) => (
                  <span
                    key={descuento.id}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    <Percent className="h-3 w-3" />
                    {descuento.texto}
                  </span>
                ))}
            </div>

            <ul className="space-y-3">
              {groupedRooms.map((group) => (
                <li key={`${hotel.hotelId}-${group.tipo}`}>
                  <HabitacionItem
                    hotelData={hotelData}
                    habitacionGroup={group}
                    hotelInCart={hotelInCart}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby={`packages-${hotel.hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <h3
              id={`packages-${hotel.hotelId}-title`}
              className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
            >
              <Package className="h-5 w-5" />
              Paquetes Turísticos
            </h3>
            <ul className="space-y-3">
              {Array.isArray(hotel.paquetes) && hotel.paquetes.length > 0 ? (
                hotel.paquetes.map((paquete) => (
                  <li key={paquete.id}>
                    <PaqueteItem
                      hotelData={hotelData}
                      paquete={paquete}
                      isSelected={hotelInCart?.paquetes?.some(
                        (p) => p.id === paquete.id
                      )}
                      onSelect={togglePackageSelection}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">
                  No hay paquetes disponibles.
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}

export default HotelCard;
