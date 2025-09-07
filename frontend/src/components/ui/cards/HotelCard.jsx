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

  // Hook que gestiona selección UI local (toggleRoomSelection / togglePackageSelection)
  const { toggleRoomSelection, togglePackageSelection } =
    useHotelSelection(hotel);

  const { carrito } = useCarrito();

  // Determinar id del hotel (nuevo formato usa hotelId)
  const hotelId = hotel.hotelId ?? hotel.id;

  // Buscar el hotel en el carrito (adaptado a idHotel)
  const hotelInCart = carrito.hoteles.find((h) => h.idHotel === hotelId);

  // Listas de ids seleccionados en el carrito (para marcar checkboxes)
  const habitacionesSeleccionadas =
    hotelInCart?.habitaciones.map((hab) => hab.id) || [];
  const paquetesSeleccionados =
    hotelInCart?.paquetes.map((paq) => paq.id) || [];

  /**
   * Construimos hotelData tal como lo espera el resto de la app:
   * - idHotel: hotelId
   * - nombre, descripcion
   * - coeficiente: si viene como campo use ese, sino intentar derivar desde temporada.porcentaje
   * - temporada: usamos temporada.tipo (string) para compatibilidad con lógica existente
   */
  const coeficiente =
    typeof hotel.coeficiente === 'number'
      ? hotel.coeficiente
      : hotel.temporada && hotel.temporada.porcentaje
        ? Number(hotel.temporada.porcentaje)
        : 0;

  const hotelData = {
    idHotel: hotelId,
    nombre: hotel.nombre,
    descripcion: hotel.descripcion ?? null,
    coeficiente,
    temporada: hotel.temporada ? (hotel.temporada.tipo ?? null) : null,
  };

  /**
   * Flatten rooms: la API trae `habitaciones` como array de grupos:
   * [ { "Dobles": [{id, numero, piso}, ...], "capacidad": 2 }, ... ]
   *
   * Convertimos a array plano de instancias:
   * [{ id, nombre, capacidad, precio, piso, numero, tipo }]
   *
   * Hacemos esto con useMemo por rendimiento.
   */
  const flatRooms = useMemo(() => {
    const groups = Array.isArray(hotel.habitaciones) ? hotel.habitaciones : [];
    const result = [];

    groups.forEach((group, gi) => {
      // la key del tipo (ej. "Dobles", "Simples", etc.)
      const typeKey = Object.keys(group).find((k) => k !== 'capacidad');
      if (!typeKey) {
        console.warn(
          `[HotelCard] Grupo de habitación sin clave esperada en hotel ${hotelId}`,
          group
        );
        return;
      }

      const instances = Array.isArray(group[typeKey]) ? group[typeKey] : [];
      const capacidad = Number(group.capacidad) || null;

      instances.forEach((inst) => {
        result.push({
          id: inst.id,
          nombre: `${typeKey} - ${inst.numero}`, // p. ej. "Dobles - 9"
          capacidad: capacidad,
          precio: inst.precio ?? null, // si la API trae precio por instancia lo usamos; si no queda null
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
      <HotelHeader
        hotel={{
          // Normalizamos mínimamente para que HotelHeader reciba datos esperables
          id: hotelId,
          nombre: hotel.nombre,
          descripcion: hotel.descripcion,
          estrellas: Number(hotel.estrellas) || undefined,
          ubicacion: {
            pais: hotel.ubicacion?.nombrePais ?? hotel.ubicacion?.pais,
            provincia:
              hotel.ubicacion?.nombreProvincia ?? hotel.ubicacion?.provincia,
            ciudad: hotel.ubicacion?.nombreCiudad ?? hotel.ubicacion?.ciudad,
          },
          imagen: hotel.imagen ?? null,
        }}
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
