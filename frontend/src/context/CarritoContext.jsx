// CarritoContext.jsx
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

      // Si ya existe, hacemos merge: actualizamos sólo si vienen datos nuevos
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) =>
          hotel.hotelId === payload.hotelId
            ? {
                ...hotel,
                // sólo setea nombre/temporada si no existen aún en el hotel o si vienen en el payload
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

const CarritoContext = createContext(undefined);

/** Asegura que el hotel existe en el carrito. Si ya existe, no sobrescribe con nulls. */
function asegurarHotel(dispatch, { hotelId, nombre, temporada }) {
  dispatch({
    type: TIPOS.AGREGAR_HOTEL,
    payload: { hotelId, nombre, temporada },
  });
}

/** Agrega elemento (habitacion/paquete) normalizando fechas y seteando addedAt. */
function agregarElemento(dispatch, tipo, hotelInfo, elemento, fechas = {}) {
  // Aseguramos que la entrada del hotel exista y que al crearla se guarde metadata si viene
  asegurarHotel(dispatch, hotelInfo);

  // Normalizamos fechas (si vienen) — si las ignorás por ahora, se dejarán null
  let fechaInicio = fechas.fechaInicio ?? elemento.fechaInicio ?? null;
  let fechaFin = fechas.fechaFin ?? elemento.fechaFin ?? null;

  fechaInicio = normalizeDateValue(fechaInicio);
  fechaFin = normalizeDateValue(fechaFin);

  const item = {
    ...elemento,
    fechaInicio,
    fechaFin,
    // timestamp para controlar orden de selección (LIFO si hace falta)
    addedAt: Date.now(),
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

  // Normalización / migración al montar
  useEffect(() => {
    const normalizeHoteles = (hoteles = []) =>
      (hoteles || []).map((h) => ({
        ...h,
        hotelId: h.hotelId || h.idHotel,
        habitaciones: (h.habitaciones || []).map((hab) => ({
          ...hab,
          fechaInicio: normalizeDateValue(hab.fechaInicio),
          fechaFin: normalizeDateValue(hab.fechaFin),
          // preserve addedAt si existe o setear null (no forzamos new Date aquí)
          addedAt: hab.addedAt ?? null,
        })),
        paquetes: (h.paquetes || []).map((p) => ({
          ...p,
          fechaInicio: normalizeDateValue(p.fechaInicio),
          fechaFin: normalizeDateValue(p.fechaFin),
          addedAt: p.addedAt ?? null,
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

  // Persistir cambios
  useEffect(() => {
    setPersistedState(estado);
  }, [estado, setPersistedState]);

  // ---------- Acciones (API en español, retrocompatibilidad) ----------
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

  // ---------- Wrappers con firma (hotelId, ...) para conveniencia ----------
  const addRoom = useCallback(
    (hotelId, roomObj, fechas) => {
      return agregarHabitacion({ hotelId }, roomObj, fechas);
    },
    [agregarHabitacion]
  );

  const removeRoom = useCallback(
    (hotelId, roomId) => {
      return removerHabitacion(hotelId, roomId);
    },
    [removerHabitacion]
  );

  const addPackage = useCallback(
    (hotelId, pkgObj, fechas) => {
      return agregarPaquete({ hotelId }, pkgObj, fechas);
    },
    [agregarPaquete]
  );

  const removePackage = useCallback(
    (hotelId, pkgId) => {
      return removerPaquete(hotelId, pkgId);
    },
    [removerPaquete]
  );

  // ---------- Selectores por hotel (referencias estables) ----------
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
      // API en español (retrocompat)
      agregarHabitacion,
      agregarPaquete,
      removerHabitacion,
      removerPaquete,
      removerHotel,
      totalElementos,
      // wrappers convenientes (firma: hotelId, ...)
      addRoom,
      removeRoom,
      addPackage,
      removePackage,
      // selectores
      getSelectedRoomIdsForHotel,
      getSelectedRoomsForHotel,
      getSelectedPackageIdsForHotel,
      // entrada completa
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
      addRoom,
      removeRoom,
      addPackage,
      removePackage,
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
