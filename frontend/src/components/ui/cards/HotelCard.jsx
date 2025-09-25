import { useState, useMemo } from 'react';
import { Bed, Package } from 'lucide-react';
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

  const hotelId = hotel.hotelId ?? hotel.id;

  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotelId);

  // hotelData que se pase a child components (normalizado)
  const hotelData = {
    idHotel: hotelId,
    nombre: hotel.nombre,
    descripcion: hotel.descripcion ?? null,
    coeficiente:
      typeof hotel.coeficiente === 'number'
        ? hotel.coeficiente
        : hotel.temporada?.porcentaje
          ? Number(hotel.temporada.porcentaje)
          : 0,
    temporada: hotel.temporada?.tipo ?? null,
  };

  // Agrupar habitaciones por tipo usando useMemo (mejora rendimiento)
  const groupedRooms = useMemo(() => {
    const groups = Array.isArray(hotel.habitaciones) ? hotel.habitaciones : [];
    const result = [];

    groups.forEach((group) => {
      // cada group tiene una clave que es el tipo (ej: "Deluxe") y 'capacidad'
      const typeKey = Object.keys(group).find((k) => k !== 'capacidad');
      if (!typeKey) {
        console.warn(`Grupo sin clave esperada en hotel ${hotelId}`, group);
        return;
      }

      const instances = Array.isArray(group[typeKey]) ? group[typeKey] : [];
      const capacidad = Number(group.capacidad) || null;

      result.push({
        tipo: typeKey,
        capacidad,
        instances,
      });
    });

    return result;
  }, [hotel.habitaciones, hotelId]);

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
            aria-labelledby={`rooms-${hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <h3
              id={`rooms-${hotelId}-title`}
              className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
            >
              <Bed className="h-5 w-5" />
              Habitaciones Disponibles
            </h3>

            <ul className="space-y-3">
              {groupedRooms.map((group) => (
                <li key={`${hotelId}-${group.tipo}`}>
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
            aria-labelledby={`packages-${hotelId}-title`}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <h3
              id={`packages-${hotelId}-title`}
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
