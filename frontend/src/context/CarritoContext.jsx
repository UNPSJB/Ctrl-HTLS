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
  REEMPLAZAR_ESTADO: 'REEMPLAZAR_ESTADO',
};

// Reducer
function carritoReducer(estado, accion) {
  switch (accion.type) {
    case TIPOS.AGREGAR_HOTEL: {
      if (estado.hoteles.some((h) => h.hotelId === accion.payload.hotelId)) {
        return estado;
      }
      return {
        ...estado,
        hoteles: [
          ...estado.hoteles,
          {
            hotelId: accion.payload.hotelId,
            nombre: accion.payload.nombre,
            temporada: accion.payload.temporada,
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
          hotel.hotelId === accion.payload.hotelId
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
          hotel.hotelId === accion.payload.hotelId
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
          if (hotel.hotelId === accion.payload.hotelId) {
            const updatedHabitaciones = hotel.habitaciones.filter(
              (room) => room.id !== accion.payload.habitacionId
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
          if (hotel.hotelId === accion.payload.hotelId) {
            const updatedPaquetes = hotel.paquetes.filter(
              (pkg) => pkg.id !== accion.payload.paqueteId
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
          (hotel) => hotel.hotelId !== accion.payload.hotelId
        ),
      };

    case TIPOS.REEMPLAZAR_ESTADO:
      return accion.payload ?? estado;

    default:
      return estado;
  }
}

// Crear contexto
const CarritoContext = createContext(undefined);

// Helper: normaliza valor de fecha -> null si vacío/espacios
function normalizeDateValue(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

// Función para asegurar que el hotel existe en el carrito
function asegurarHotel(dispatch, { hotelId, nombre, temporada }) {
  dispatch({
    type: TIPOS.AGREGAR_HOTEL,
    payload: { hotelId, nombre, temporada },
  });
}

// Función genérica para agregar elementos con normalización de fechas
function agregarElemento(dispatch, tipo, hotelInfo, elemento, fechas = {}) {
  asegurarHotel(dispatch, hotelInfo);

  // Normalizamos y forzamos que fecha fields estén siempre en el objeto
  let fechaInicio = fechas.fechaInicio ?? elemento.fechaInicio ?? null;
  let fechaFin = fechas.fechaFin ?? elemento.fechaFin ?? null;

  fechaInicio = normalizeDateValue(fechaInicio);
  fechaFin = normalizeDateValue(fechaFin);

  const item = {
    ...elemento,
    fechaInicio,
    fechaFin,
  };

  dispatch({
    type: tipo,
    payload: {
      hotelId: hotelInfo.hotelId,
      [tipo === TIPOS.AGREGAR_HABITACION ? 'habitacion' : 'paquete']: item,
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

  // Inicializar reducer con estado persistido
  const [estado, dispatch] = useReducer(carritoReducer, persistedState);

  // Al montar: normalizar persistedState (migración)
  useEffect(() => {
    const normalizeHoteles = (hoteles = []) =>
      (hoteles || []).map((h) => ({
        ...h,
        // Asegurar que se use hotelId en lugar de idHotel
        hotelId: h.hotelId || h.idHotel,
        habitaciones: (h.habitaciones || []).map((hab) => ({
          ...hab,
          fechaInicio: normalizeDateValue(hab.fechaInicio),
          fechaFin: normalizeDateValue(hab.fechaFin),
        })),
        paquetes: (h.paquetes || []).map((p) => ({
          ...p,
          fechaInicio: normalizeDateValue(p.fechaInicio),
          fechaFin: normalizeDateValue(p.fechaFin),
        })),
      }));

    const normalized = {
      ...persistedState,
      hoteles: normalizeHoteles(persistedState.hoteles || []),
    };

    // Si hay diferencia con persistedState, actualizamos persisted y el reducer
    if (JSON.stringify(normalized) !== JSON.stringify(persistedState)) {
      setPersistedState(normalized);
      dispatch({ type: TIPOS.REEMPLAZAR_ESTADO, payload: normalized });
    }
  }, []); // solo en mount

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
    (hotelId, habitacionId) =>
      dispatch({
        type: TIPOS.REMOVER_HABITACION,
        payload: { hotelId, habitacionId },
      }),
    [dispatch]
  );

  const removerPaquete = useCallback(
    (hotelId, paqueteId) =>
      dispatch({
        type: TIPOS.REMOVER_PAQUETE,
        payload: { hotelId, paqueteId },
      }),
    [dispatch]
  );

  const removerHotel = useCallback(
    (hotelId) => dispatch({ type: TIPOS.REMOVER_HOTEL, payload: { hotelId } }),
    [dispatch]
  );

  const totalElementos = useMemo(
    () =>
      estado.hoteles.reduce(
        (acum, hotel) =>
          acum +
          (hotel.habitaciones ? hotel.habitaciones.length : 0) +
          (hotel.paquetes ? hotel.paquetes.length : 0),
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
