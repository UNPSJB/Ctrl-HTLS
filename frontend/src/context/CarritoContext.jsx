import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

const STORAGE_KEY = 'carritoState';

// Estado inicial
const estadoInicial = {
  hoteles: [],
};

// Tipos de acción
const TIPOS = {
  AGREGAR_HOTEL: 'AGREGAR_HOTEL',
  AGREGAR_HABITACION: 'AGREGAR_HABITACION',
  AGREGAR_PAQUETE: 'AGREGAR_PAQUETE',
  REMOVER_HABITACION: 'REMOVER_HABITACION',
  REMOVER_PAQUETE: 'REMOVER_PAQUETE',
  REMOVER_HOTEL: 'REMOVER_HOTEL',
};

// Reducer
function carritoReducer(estado, accion) {
  switch (accion.type) {
    case TIPOS.AGREGAR_HOTEL: {
      if (estado.hoteles.some((h) => h.idHotel === accion.payload.idHotel)) {
        return estado;
      }
      return {
        ...estado,
        hoteles: [
          ...estado.hoteles,
          {
            idHotel: accion.payload.idHotel,
            nombre: accion.payload.nombre,
            temporada: accion.payload.temporada,
            coeficiente: accion.payload.coeficiente,
            habitaciones: [],
            paquetes: [],
          },
        ],
      };
    }
    case TIPOS.AGREGAR_HABITACION: {
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) =>
          hotel.idHotel === accion.payload.idHotel
            ? hotel.habitaciones.some(
                (room) => room.id === accion.payload.habitacion.id
              )
              ? hotel
              : {
                  ...hotel,
                  habitaciones: [
                    ...hotel.habitaciones,
                    accion.payload.habitacion,
                  ],
                }
            : hotel
        ),
      };
    }
    case TIPOS.AGREGAR_PAQUETE: {
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) =>
          hotel.idHotel === accion.payload.idHotel
            ? hotel.paquetes.some((pkg) => pkg.id === accion.payload.paquete.id)
              ? hotel
              : {
                  ...hotel,
                  paquetes: [...hotel.paquetes, accion.payload.paquete],
                }
            : hotel
        ),
      };
    }
    case TIPOS.REMOVER_HABITACION: {
      const nuevosHoteles = estado.hoteles
        .map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            const updatedHabitaciones = hotel.habitaciones.filter(
              (room) => room.id !== accion.payload.idHabitacion
            );
            if (
              updatedHabitaciones.length === 0 &&
              hotel.paquetes.length === 0
            ) {
              return null;
            }
            return { ...hotel, habitaciones: updatedHabitaciones };
          }
          return hotel;
        })
        .filter(Boolean);
      return { ...estado, hoteles: nuevosHoteles };
    }
    case TIPOS.REMOVER_PAQUETE: {
      const nuevosHoteles = estado.hoteles
        .map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            const updatedPaquetes = hotel.paquetes.filter(
              (pkg) => pkg.id !== accion.payload.idPaquete
            );
            if (
              hotel.habitaciones.length === 0 &&
              updatedPaquetes.length === 0
            ) {
              return null;
            }
            return { ...hotel, paquetes: updatedPaquetes };
          }
          return hotel;
        })
        .filter(Boolean);
      return { ...estado, hoteles: nuevosHoteles };
    }
    case TIPOS.REMOVER_HOTEL:
      return {
        ...estado,
        hoteles: estado.hoteles.filter(
          (hotel) => hotel.idHotel !== accion.payload.idHotel
        ),
      };
    default:
      return estado;
  }
}

// Crear contexto
const CarritoContext = createContext(undefined);

// --- NUEVO: función para asegurar que el hotel existe en el carrito ---
function asegurarHotel(dispatch, { idHotel, nombre, temporada, coeficiente }) {
  dispatch({
    type: TIPOS.AGREGAR_HOTEL,
    payload: { idHotel, nombre, temporada, coeficiente },
  });
}

// --- NUEVO: función genérica para agregar elementos ---
function agregarElemento(dispatch, tipo, hotelInfo, elemento, fechas = {}) {
  asegurarHotel(dispatch, hotelInfo);
  dispatch({
    type: tipo,
    payload: {
      idHotel: hotelInfo.idHotel,
      [tipo === TIPOS.AGREGAR_HABITACION ? 'habitacion' : 'paquete']: {
        ...elemento,
        ...fechas,
      },
    },
  });
}

// Provider
export function CarritoProvider({ children }) {
  // Usar usePersistedState para el estado persistente
  const [persistedState, setPersistedState] = usePersistedState(
    STORAGE_KEY,
    estadoInicial
  );

  // useReducer con estado inicial desde localStorage
  const [estado, dispatch] = useReducer(carritoReducer, persistedState);

  // Sincronizar cambios del reducer con localStorage
  useEffect(() => {
    setPersistedState(estado);
  }, [estado, setPersistedState]);

  // Acciones memoizadas
  const agregarHabitacion = useCallback(
    (hotelInfo, habitacion, fechas) =>
      agregarElemento(
        dispatch,
        TIPOS.AGREGAR_HABITACION,
        hotelInfo,
        habitacion,
        fechas
      ),
    [dispatch]
  );

  const agregarPaquete = useCallback(
    (hotelInfo, paquete, fechas) =>
      agregarElemento(
        dispatch,
        TIPOS.AGREGAR_PAQUETE,
        hotelInfo,
        paquete,
        fechas
      ),
    [dispatch]
  );

  const removerHabitacion = useCallback(
    (idHotel, idHabitacion) =>
      dispatch({
        type: TIPOS.REMOVER_HABITACION,
        payload: { idHotel, idHabitacion },
      }),
    [dispatch]
  );

  const removerPaquete = useCallback(
    (idHotel, idPaquete) =>
      dispatch({
        type: TIPOS.REMOVER_PAQUETE,
        payload: { idHotel, idPaquete },
      }),
    [dispatch]
  );

  const removerHotel = useCallback(
    (idHotel) => dispatch({ type: TIPOS.REMOVER_HOTEL, payload: { idHotel } }),
    [dispatch]
  );

  const totalElementos = useMemo(
    () =>
      estado.hoteles.reduce(
        (acum, hotel) =>
          acum + hotel.habitaciones.length + hotel.paquetes.length,
        0
      ),
    [estado.hoteles]
  );

  const value = useMemo(
    () => ({
      carrito: estado,
      agregarHabitacion,
      agregarPaquete,
      removerHabitacion,
      removerPaquete,
      removerHotel,
      totalElementos,
    }),
    [
      estado,
      agregarHabitacion,
      agregarPaquete,
      removerHabitacion,
      removerPaquete,
      removerHotel,
      totalElementos,
    ]
  );

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

// Hook para consumir el contexto
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe utilizarse dentro de un CarritoProvider');
  }
  return context;
}
