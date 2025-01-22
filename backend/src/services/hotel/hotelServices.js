const Hotel = require('../../models/hotel/Hotel');
const { verificarCiudad } = require('../../utils/helpers');
const CustomError = require('../../utils/CustomError');

const crearHotel = async (
  nombre,
  direccion,
  telefono,
  email,
  ciudadId,
  encargadoId,
  categoriaId,
) => {
  await verificarCiudad(ciudadId);

  // Verificar si ya existe un hotel con el mismo nombre en la misma ciudad
  const hotelExistenteNombre = await Hotel.findOne({
    where: { nombre, ciudadId },
  });
  if (hotelExistenteNombre) {
    throw new CustomError(
      'Ya existe un hotel con el mismo nombre en esta ciudad',
      409,
    ); // Conflict
  }

  // Verificar si ya existe un hotel con la misma dirección en la misma ciudad
  const hotelExistenteDireccion = await Hotel.findOne({
    where: { direccion, ciudadId },
  });
  if (hotelExistenteDireccion) {
    throw new CustomError(
      'Ya existe un hotel con la misma dirección en esta ciudad',
      409,
    ); // Conflict
  }

  // Crear el nuevo hotel
  const nuevoHotel = await Hotel.create({
    nombre,
    direccion,
    telefono,
    email,
    ciudadId,
    encargadoId,
    categoriaId,
  });

  return nuevoHotel;
};

module.exports = { crearHotel };
