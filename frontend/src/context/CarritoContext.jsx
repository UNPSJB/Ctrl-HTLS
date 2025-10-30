import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import dateUtils from '../utils/dateUtils';

const { normalizeDateValue } = dateUtils;
const STORAGE_KEY = 'carritoState';
const SEARCH_FILTERS_KEY = 'busquedaFilters';

const estadoInicial = {
  hoteles: [],
};

const TIPOS = {
  AGREGAR_HOTEL: 'AGREGAR_HOTEL',
  AGREGAR_HABITACION: 'AGREGAR_HABITACION',
  AGREGAR_PAQUETE: 'AGREGAR_PAQUETE',
  REMOVER_HABITACION: 'REMOVER_HABITACION',
  REMOVER_PAQUETE: 'REMOVER_PAQUETE',
  REMOVER_HOTEL: 'REMOVER_HOTEL',
  REEMPLAZAR_ESTADO: 'REEMPLAZAR_ESTADO',
};

function carritoReducer(estado, accion) {
  switch (accion.type) {
    case TIPOS.AGREGAR_HOTEL: {
      const payload = accion.payload || {};
      const exists = estado.hoteles.some((h) => h.hotelId === payload.hotelId);

      if (!exists) {
        return {
          ...estado,
          hoteles: [
            ...estado.hoteles,
            {
              hotelId: payload.hotelId,
              nombre: payload.nombre ?? null,
              temporada: payload.temporada ?? null,
              habitaciones: [],
              paquetes: [],
            },
          ],
        };
      }

      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) =>
          hotel.hotelId === payload.hotelId
            ? {
                ...hotel,
                nombre: hotel.nombre ?? payload.nombre ?? hotel.nombre,
                temporada:
                  hotel.temporada ?? payload.temporada ?? hotel.temporada,
              }
            : hotel
        ),
      };
    }

    case TIPOS.AGREGAR_HABITACION: {
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) =>
          hotel.hotelId === accion.payload.hotelId
            ? {
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
            ? {
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
            // Se filtra por el _cartId único en lugar del id de la habitación
            const updatedHabitaciones = hotel.habitaciones.filter(
              (room) => room._cartId !== accion.payload.cartId
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
            // Se filtra por el _cartId único
            const updatedPaquetes = hotel.paquetes.filter(
              (pkg) => pkg._cartId !== accion.payload.cartId
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

const CarritoContext = createContext(undefined);

function asegurarHotel(dispatch, { hotelId, nombre, temporada }) {
  dispatch({
    type: TIPOS.AGREGAR_HOTEL,
    payload: { hotelId, nombre, temporada },
  });
}

function resolveDates(fechas = {}, elemento = {}) {
  let fechaInicio = fechas.fechaInicio ?? elemento.fechaInicio ?? null;
  let fechaFin = fechas.fechaFin ?? elemento.fechaFin ?? null;

  if (
    (fechaInicio == null || fechaInicio === '') &&
    (fechaFin == null || fechaFin === '')
  ) {
    try {
      const raw =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(SEARCH_FILTERS_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          fechaInicio = fechaInicio ?? parsed.fechaInicio ?? null;
          fechaFin = fechaFin ?? parsed.fechaFin ?? null;
        }
      }
    } catch (err) {
      // No hacemos nada si falla la lectura
    }
  }

  fechaInicio = normalizeDateValue(fechaInicio);
  fechaFin = normalizeDateValue(fechaFin);

  return { fechaInicio, fechaFin };
}

function agregarElemento(dispatch, tipo, hotelInfo, elemento, fechas = {}) {
  asegurarHotel(dispatch, hotelInfo);

  const { fechaInicio, fechaFin } = resolveDates(fechas, elemento);

  const item = {
    ...elemento,
    // Se añade un ID único para esta entrada específica del carrito
    _cartId: `cart-item-${Date.now()}-${Math.random()}`,
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

export function CarritoProvider({ children }) {
  const [persistedState, setPersistedState] = usePersistedState(
    STORAGE_KEY,
    estadoInicial
  );
  const [estado, dispatch] = useReducer(carritoReducer, persistedState);

  useEffect(() => {
    const normalizeHoteles = (hoteles = []) =>
      (hoteles || []).map((h) => ({
        ...h,
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

    if (JSON.stringify(normalized) !== JSON.stringify(persistedState)) {
      setPersistedState(normalized);
      dispatch({ type: TIPOS.REEMPLAZAR_ESTADO, payload: normalized });
    }
  }, []);

  useEffect(() => {
    setPersistedState(estado);
  }, [estado, setPersistedState]);

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
    (hotelId, cartId) =>
      dispatch({
        type: TIPOS.REMOVER_HABITACION,
        payload: { hotelId, cartId },
      }),
    [dispatch]
  );

  const removerPaquete = useCallback(
    (hotelId, cartId) =>
      dispatch({
        type: TIPOS.REMOVER_PAQUETE,
        payload: { hotelId, cartId },
      }),
    [dispatch]
  );

  const removerHotel = useCallback(
    (hotelId) => dispatch({ type: TIPOS.REMOVER_HOTEL, payload: { hotelId } }),
    [dispatch]
  );

  const getHotelEntry = useCallback(
    (hotelId) => estado.hoteles.find((h) => h.hotelId === hotelId) || null,
    [estado.hoteles]
  );

  const getSelectedRoomIdsForHotel = useCallback(
    (hotelId) => {
      const entry = getHotelEntry(hotelId);
      return (entry?.habitaciones || []).map((r) => r.id).filter(Boolean);
    },
    [getHotelEntry]
  );

  const getSelectedRoomsForHotel = useCallback(
    (hotelId) => {
      const entry = getHotelEntry(hotelId);
      return entry?.habitaciones ? [...entry.habitaciones] : [];
    },
    [getHotelEntry]
  );

  const getSelectedPackageIdsForHotel = useCallback(
    (hotelId) => {
      const entry = getHotelEntry(hotelId);
      return (entry?.paquetes || []).map((p) => p.id).filter(Boolean);
    },
    [getHotelEntry]
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
      getSelectedRoomIdsForHotel,
      getSelectedRoomsForHotel,
      getSelectedPackageIdsForHotel,
      getHotelEntry,
    }),
    [
      estado,
      agregarHabitacion,
      agregarPaquete,
      removerHabitacion,
      removerPaquete,
      removerHotel,
      totalElementos,
      getSelectedRoomIdsForHotel,
      getSelectedRoomsForHotel,
      getSelectedPackageIdsForHotel,
      getHotelEntry,
    ]
  );

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe utilizarse dentro de un CarritoProvider');
  }
  return context;
}
