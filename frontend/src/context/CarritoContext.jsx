import { createContext, useContext, useReducer, useMemo } from 'react';

const estadoInicial = {
  // Cada objeto representa un hotel en el carrito:
  // { idHotel, temporada, coeficiente, habitaciones: [], paquetes: [], datos: {} }
  hoteles: [],
};

const carritoReducer = (estado, accion) => {
  switch (accion.type) {
    case 'AGREGAR_HOTEL':
      // Si el hotel ya existe, no se actualiza
      if (
        estado.hoteles.find((hotel) => hotel.idHotel === accion.payload.idHotel)
      ) {
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
            datos: {},
          },
        ],
      };

    case 'AGREGAR_HABITACION':
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
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

    case 'AGREGAR_PAQUETE':
      return {
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

    case 'REMOVER_HABITACION':
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            return {
              ...hotel,
              habitaciones: hotel.habitaciones.filter(
                (id) => id !== accion.payload.idHabitacion
              ),
            };
          }
          return hotel;
        }),
      };

    case 'REMOVER_PAQUETE':
      return {
        ...estado,
        hoteles: estado.hoteles.map((hotel) => {
          if (hotel.idHotel === accion.payload.idHotel) {
            return {
              ...hotel,
              paquetes: hotel.paquetes.filter(
                (id) => id !== accion.payload.idPaquete
              ),
            };
          }
          return hotel;
        }),
      };

    case 'REMOVER_HOTEL':
      return {
        ...estado,
        hoteles: estado.hoteles.filter(
          (hotel) => hotel.idHotel !== accion.payload.idHotel
        ),
      };

    default:
      return estado;
  }
};

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [estado, dispatch] = useReducer(carritoReducer, estadoInicial);

  // Se recibe un objeto con idHotel, temporada y coeficiente
  const agregarHotel = ({ idHotel, temporada, coeficiente }) => {
    dispatch({
      type: 'AGREGAR_HOTEL',
      payload: { idHotel, temporada, coeficiente },
    });
  };

  // Las funciones de agregar habitación o paquete se actualizan para recibir también la info del hotel
  const agregarHabitacion = (idHotel, idHabitacion, temporada, coeficiente) => {
    // Aseguramos que el hotel se agregue con la información necesaria
    agregarHotel({ idHotel, temporada, coeficiente });
    dispatch({
      type: 'AGREGAR_HABITACION',
      payload: { idHotel, idHabitacion },
    });
  };

  const agregarPaquete = (idHotel, idPaquete, temporada, coeficiente) => {
    agregarHotel({ idHotel, temporada, coeficiente });
    dispatch({ type: 'AGREGAR_PAQUETE', payload: { idHotel, idPaquete } });
  };

  const removerHabitacion = (idHotel, idHabitacion) => {
    dispatch({
      type: 'REMOVER_HABITACION',
      payload: { idHotel, idHabitacion },
    });
  };

  const removerPaquete = (idHotel, idPaquete) => {
    dispatch({ type: 'REMOVER_PAQUETE', payload: { idHotel, idPaquete } });
  };

  const removerHotel = (idHotel) => {
    dispatch({ type: 'REMOVER_HOTEL', payload: { idHotel } });
  };

  // Total de elementos en el carrito
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
