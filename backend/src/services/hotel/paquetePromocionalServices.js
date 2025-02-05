const PaquetePromocional = require('../../models/hotel/PaquetePromocional');
const PaquetePromocionalHabitacion = require('../../models/hotel/PaquetePromocionalHabitacion');
const Hotel = require('../../models/hotel/Hotel');
const CustomError = require('../../utils/CustomError');
const Habitacion = require('../../models/hotel/Habitacion');
const {
  verificarHabitacionesPaquetePromocional,
} = require('./habitacionServices');
const { verificarPorcentaje } = require('../../utils/helpers');

const crearPaquete = async (idHotel, paquete) => {
  // Verificar si el hotel existe
  const hotel = await Hotel.findByPk(idHotel);
  if (!hotel) {
    throw new CustomError('El hotel no existe', 404); // Not Found
  }

  await verificarPorcentaje(paquete.coeficiente_descuento);

  // Verificar si el paquete promocional ya existe
  const paquetePromocionalExistente = await PaquetePromocional.findOne({
    where: { nombre: paquete.nombre },
  });
  if (paquetePromocionalExistente) {
    throw new CustomError(
      'Ya existe un paquete promocional con el mismo nombre',
      409,
    ); // Conflict
  }

  // Verificar si las habitaciones ya estan asignadas a otro paquete en la misma fecha
  await verificarHabitacionesPaquetePromocional(
    paquete.habitaciones,
    paquete.fecha_inicio,
    paquete.fecha_fin,
  );

  // Crear el paquete promocional
  const nuevoPaquetePromocional = await PaquetePromocional.create({
    ...paquete,
    hotelId: idHotel,
  });
  return nuevoPaquetePromocional;
};

//IMPLEMENTAR
const modificarPaquete = async (idPaquete, paquete) => {};

//IMPLEMENTAR
const eliminarPaquete = async (idPaquete) => {};

const asignarHabitacionAPaquete = async (paqueteCreado, paquete) => {
  for (const habitacion of paquete.habitaciones) {
    await PaquetePromocionalHabitacion.create({
      habitacionId: habitacion,
      paquetePromocionalId: paqueteCreado.id,
      fechaInicio: paqueteCreado.fecha_inicio,
      fechaFin: paqueteCreado.fecha_fin,
    });
  }

  return getPaqueteCompleto(paqueteCreado.id);
};

const getPaqueteCompleto = async (idPaquete) => {
  const paquete = await PaquetePromocional.findByPk(idPaquete, {
    include: [
      {
        model: Habitacion,
        as: 'habitaciones',
        through: {
          model: PaquetePromocionalHabitacion,
          attributes: ['fechaInicio', 'fechaFin'],
        },
      },
    ],
  });

  if (!paquete) {
    throw new CustomError('El paquete promocional no existe', 404); // Not Found
  }

  return paquete;
};

module.exports = { crearPaquete, asignarHabitacionAPaquete };
