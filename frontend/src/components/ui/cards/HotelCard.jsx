// src/components/hotel/HotelCard.jsx
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

  // Hook que gestiona selección UI local
  const { toggleRoomSelection, togglePackageSelection } =
    useHotelSelection(hotel);
  const { carrito } = useCarrito();

  // Determinar id del hotel (nuevo formato usa hotelId)
  const hotelId = hotel.hotelId ?? hotel.id;

  // Buscar el hotel en el carrito
  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotelId);

  // Listas de ids seleccionados en el carrito
  const habitacionesSeleccionadas =
    hotelInCart?.habitaciones.map((hab) => hab.id) || [];
  const paquetesSeleccionados =
    hotelInCart?.paquetes.map((paq) => paq.id) || [];

  // Solo crear hotelData para componentes que realmente lo necesitan (HabitacionItem/PaqueteItem)
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

  // Flatten rooms con useMemo por rendimiento
  const flatRooms = useMemo(() => {
    const groups = Array.isArray(hotel.habitaciones) ? hotel.habitaciones : [];
    const result = [];

    groups.forEach((group) => {
      const typeKey = Object.keys(group).find((k) => k !== 'capacidad');
      if (!typeKey) {
        console.warn(
          `Grupo de habitación sin clave esperada en hotel ${hotelId}`,
          group
        );
        return;
      }

      const instances = Array.isArray(group[typeKey]) ? group[typeKey] : [];
      const capacidad = Number(group.capacidad) || null;

      instances.forEach((inst) => {
        result.push({
          id: inst.id,
          nombre: `${typeKey} - ${inst.numero}`,
          capacidad: capacidad,
          precio: inst.precio ?? null,
          piso: inst.piso ?? null,
          numero: inst.numero ?? null,
          tipo: typeKey,
        });
      });
    });

    return result;
  }, [hotel.habitaciones, hotelId]);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      {/* Pasar los datos originales directamente */}
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
              {flatRooms.map((habitacion) => (
                <li key={habitacion.id}>
                  <HabitacionItem
                    hotelData={hotelData}
                    habitacion={habitacion}
                    isSelected={habitacionesSeleccionadas.includes(
                      habitacion.id
                    )}
                    onSelect={toggleRoomSelection}
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
                      isSelected={paquetesSeleccionados.includes(paquete.id)}
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
