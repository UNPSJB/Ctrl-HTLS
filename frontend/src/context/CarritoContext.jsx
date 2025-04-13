import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from 'react';

const STORAGE_KEY = 'carritoState'; // Clave para almacenar en el localStorage

const estadoInicial = {
  // Cada objeto representa un hotel en el carrito:
  // { idHotel, temporada, coeficiente, habitaciones: [], paquetes: [], datos: {} }
  hoteles: [],
};

// Función inicializadora para leer del localStorage
const initializer = (initialState) => {
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : initialState;
  } catch (error) {
    // En caso de error, se retorna el estado inicial
    return initialState;
  }
};

const carritoReducer = (estado, accion) => {
  let nuevoEstado;

  switch (accion.type) {
    case 'AGREGAR_HOTEL':
      // Si el hotel ya existe, no se actualiza
      if (
        estado.hoteles.find((hotel) => hotel.idHotel === accion.payload.idHotel)
      ) {
        nuevoEstado = estado;
      } else {
        nuevoEstado = {
          ...estado,
          hoteles: [
            ...estado.hoteles,
            {
              idHotel: accion.payload.idHotel,
              temporada: accion.payload.temporada,
              coeficiente: accion.payload.coeficiente,
              habitaciones: [],
              paquetes: [],
              datos: {},
            },
          ],
        };
      }
      break;

    case 'AGREGAR_HABITACION':
      nuevoEstado = {
        ...estado,
        hoteles: estado.hoteles.map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            // Evitar duplicados
            if (hotel.habitaciones.includes(accion.payload.idHabitacion))
              return hotel;
            return {
              ...hotel,
              habitaciones: [
                ...hotel.habitaciones,
                accion.payload.idHabitacion,
              ],
            };
          }
          return hotel;
        }),
      };
      break;

    case 'AGREGAR_PAQUETE':
      nuevoEstado = {
        ...estado,
        hoteles: estado.hoteles.map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            if (hotel.paquetes.includes(accion.payload.idPaquete)) return hotel;
            return {
              ...hotel,
              paquetes: [...hotel.paquetes, accion.payload.idPaquete],
            };
          }
          return hotel;
        }),
      };
      break;

    case 'REMOVER_HABITACION': {
      const nuevosHoteles = estado.hoteles
        .map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            const updatedHabitaciones = hotel.habitaciones.filter(
              (id) => id !== accion.payload.idHabitacion
            );
            // Si al quitar la habitación el hotel queda sin habitaciones y sin paquetes, se elimina
            if (
              updatedHabitaciones.length === 0 &&
              hotel.paquetes.length === 0
            ) {
              return null;
            }
            return {
              ...hotel,
              habitaciones: updatedHabitaciones,
            };
          }
          return hotel;
        })
        .filter(Boolean); // Eliminamos los hoteles nulos
      nuevoEstado = { ...estado, hoteles: nuevosHoteles };
      break;
    }

    case 'REMOVER_PAQUETE': {
      const nuevosHoteles = estado.hoteles
        .map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            const updatedPaquetes = hotel.paquetes.filter(
              (id) => id !== accion.payload.idPaquete
            );
            // Si al quitar el paquete el hotel queda sin paquetes y sin habitaciones, se elimina el hotel
            if (
              hotel.habitaciones.length === 0 &&
              updatedPaquetes.length === 0
            ) {
              return null;
            }
            return {
              ...hotel,
              paquetes: updatedPaquetes,
            };
          }
          return hotel;
        })
        .filter(Boolean);
      nuevoEstado = { ...estado, hoteles: nuevosHoteles };
      break;
    }

    case 'REMOVER_HOTEL':
      nuevoEstado = {
        ...estado,
        hoteles: estado.hoteles.filter(
          (hotel) => hotel.idHotel !== accion.payload.idHotel
        ),
      };
      break;

    default:
      nuevoEstado = estado;
  }

  // Log de consola para cada acción y el estado resultante
  console.log(
    `Acción: ${accion.type}`,
    'Payload:',
    accion.payload,
    'Nuevo estado:',
    nuevoEstado
  );

  return nuevoEstado;
};

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  // Se utiliza la función initializer para cargar el estado desde el localStorage
  const [estado, dispatch] = useReducer(
    carritoReducer,
    estadoInicial,
    initializer
  );

  // Efecto para actualizar el localStorage cada vez que cambia el estado del carrito
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  // Función para agregar hotel (se asegura de no duplicar información)
  const agregarHotel = ({ idHotel, temporada, coeficiente }) => {
    dispatch({
      type: 'AGREGAR_HOTEL',
      payload: { idHotel, temporada, coeficiente },
    });
  };

  // Función para agregar habitación: primero asegura que el hotel exista
  const agregarHabitacion = (idHotel, idHabitacion, temporada, coeficiente) => {
    agregarHotel({ idHotel, temporada, coeficiente });
    dispatch({
      type: 'AGREGAR_HABITACION',
      payload: { idHotel, idHabitacion },
    });
  };

  // Función para agregar paquete: primero asegura que el hotel exista
  const agregarPaquete = (idHotel, idPaquete, temporada, coeficiente) => {
    agregarHotel({ idHotel, temporada, coeficiente });
    dispatch({ type: 'AGREGAR_PAQUETE', payload: { idHotel, idPaquete } });
  };

  // Función para remover habitación del hotel
  const removerHabitacion = (idHotel, idHabitacion) => {
    dispatch({
      type: 'REMOVER_HABITACION',
      payload: { idHotel, idHabitacion },
    });
  };

  // Función para remover paquete del hotel
  const removerPaquete = (idHotel, idPaquete) => {
    dispatch({ type: 'REMOVER_PAQUETE', payload: { idHotel, idPaquete } });
  };

  // Función para remover el hotel completo del carrito
  const removerHotel = (idHotel) => {
    dispatch({ type: 'REMOVER_HOTEL', payload: { idHotel } });
  };

  // Calcular el total de elementos en el carrito (habitaciones + paquetes)
  const totalElementos = useMemo(() => {
    return estado.hoteles.reduce(
      (acum, hotel) => acum + hotel.habitaciones.length + hotel.paquetes.length,
      0
    );
  }, [estado.hoteles]);

  return (
    <CarritoContext.Provider
      value={{
        carrito: estado,
        agregarHotel,
        agregarHabitacion,
        agregarPaquete,
        removerHabitacion,
        removerPaquete,
        removerHotel,
        totalElementos,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe utilizarse dentro de un CarritoProvider');
  }
  return context;
};
