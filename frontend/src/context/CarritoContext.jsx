import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from 'react';

const STORAGE_KEY = 'carritoState'; // Clave para almacenar en el localStorage

const estadoInicial = {
  hoteles: [],
};

const initializer = (initialState) => {
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    return localData ? JSON.parse(localData) : initialState;
  } catch (error) {
    return initialState;
  }
};

const carritoReducer = (estado, accion) => {
  let nuevoEstado;

  switch (accion.type) {
    case 'AGREGAR_HOTEL':
      if (estado.hoteles.find((h) => h.idHotel === accion.payload.idHotel)) {
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
            if (
              hotel.habitaciones.find(
                (room) => room.id === accion.payload.habitacion.id
              )
            ) {
              return hotel;
            }
            return {
              ...hotel,
              habitaciones: [...hotel.habitaciones, accion.payload.habitacion],
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
            if (
              hotel.paquetes.find((pkg) => pkg.id === accion.payload.paquete.id)
            ) {
              return hotel;
            }
            return {
              ...hotel,
              paquetes: [...hotel.paquetes, accion.payload.paquete],
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
              (room) => room.id !== accion.payload.idHabitacion
            );
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
        .filter(Boolean);
      nuevoEstado = { ...estado, hoteles: nuevosHoteles };
      break;
    }

    case 'REMOVER_PAQUETE': {
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
  const [estado, dispatch] = useReducer(
    carritoReducer,
    estadoInicial,
    initializer
  );

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  // 🔹 Función para agregar un hotel (se asegura de no duplicar)
  const agregarHotel = ({ idHotel, temporada, coeficiente }) => {
    dispatch({
      type: 'AGREGAR_HOTEL',
      payload: { idHotel, temporada, coeficiente },
    });
  };

  // 🔹 Agrega una habitación con los datos requeridos: id, nombre, fechaInicio, fechaFin, capacidad, precio
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
      type: 'AGREGAR_HABITACION',
      payload: { idHotel, habitacion },
    });
  };

  // 🔹 Agrega un paquete con la siguiente firma:
  // agregarPaquete(idHotel, paquete, fechaInicio, fechaFin);
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
      type: 'AGREGAR_PAQUETE',
      payload: { idHotel, paquete },
    });
  };

  const removerHabitacion = (idHotel, idHabitacion) => {
    dispatch({
      type: 'REMOVER_HABITACION',
      payload: { idHotel, idHabitacion },
    });
  };

  const removerPaquete = (idHotel, idPaquete) => {
    dispatch({
      type: 'REMOVER_PAQUETE',
      payload: { idHotel, idPaquete },
    });
  };

  const removerHotel = (idHotel) => {
    dispatch({
      type: 'REMOVER_HOTEL',
      payload: { idHotel },
    });
  };

  // Total de ítems en el carrito
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
