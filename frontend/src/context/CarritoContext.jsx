import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from 'react';

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

// Inicializador desde localStorage
function initializer(initialState) {
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : initialState;
  } catch {
    return initialState;
  }
}

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

// Provider
export function CarritoProvider({ children }) {
  const [estado, dispatch] = useReducer(
    carritoReducer,
    estadoInicial,
    initializer
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  // Acciones
  const agregarHotel = ({ idHotel, temporada, coeficiente }) =>
    dispatch({
      type: TIPOS.AGREGAR_HOTEL,
      payload: { idHotel, temporada, coeficiente },
    });

  const agregarHabitacion = (
    idHotel,
    habitacionData,
    fechaInicio,
    fechaFin
  ) => {
    const habitacion = {
      id: habitacionData.id,
      nombre: habitacionData.nombre,
      capacidad: habitacionData.capacidad,
      precio: habitacionData.precio,
      fechaInicio,
      fechaFin,
    };
    agregarHotel({
      idHotel,
      temporada: habitacionData.temporada,
      coeficiente: habitacionData.coeficiente,
    });
    dispatch({
      type: TIPOS.AGREGAR_HABITACION,
      payload: { idHotel, habitacion },
    });
  };

  const agregarPaquete = (idHotel, paqueteData, fechaInicio, fechaFin) => {
    const paquete = {
      id: paqueteData.id,
      nombre: paqueteData.nombre,
      descuento: paqueteData.descuento,
      noches: paqueteData.noches,
      fechaInicio,
      fechaFin,
    };
    agregarHotel({
      idHotel,
      temporada: paqueteData.temporada,
      coeficiente: paqueteData.coeficiente,
    });
    dispatch({
      type: TIPOS.AGREGAR_PAQUETE,
      payload: { idHotel, paquete },
    });
  };

  const removerHabitacion = (idHotel, idHabitacion) =>
    dispatch({
      type: TIPOS.REMOVER_HABITACION,
      payload: { idHotel, idHabitacion },
    });

  const removerPaquete = (idHotel, idPaquete) =>
    dispatch({ type: TIPOS.REMOVER_PAQUETE, payload: { idHotel, idPaquete } });

  const removerHotel = (idHotel) =>
    dispatch({ type: TIPOS.REMOVER_HOTEL, payload: { idHotel } });

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
      agregarHotel,
      agregarHabitacion,
      agregarPaquete,
      removerHabitacion,
      removerPaquete,
      removerHotel,
      totalElementos,
    }),
    [estado]
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
