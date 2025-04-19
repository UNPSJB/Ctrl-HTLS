/**
 * Calcula el precio final de una habitación.
 * Si el hotel está en temporada alta, se aplica el discountCoefficient.
 *
 * @param {Object} room - Objeto que representa la habitación (debe tener la propiedad "precio").
 * @param {boolean} isHighSeason - Indica si es temporada alta.
 * @param {number} discountCoefficient - Coeficiente de descuento (por ejemplo, 0.1 para 10%).
 * @returns {Object} - Objeto con el precio original, final y el descuento aplicado.
 */
export const calculateRoomFinalPrice = (
  room,
  isHighSeason,
  discountCoefficient
) => {
  const noches = calcularNoches(room.fechaInicio, room.fechaFin);
  const original = room.precio * noches;
  const final = isHighSeason ? original * (1 - discountCoefficient) : original;
  return { original, final, discount: original - final };
};

/**
 * Calcula el precio final de un paquete.
 * Se suma el precio de las habitaciones incluidas, se multiplica por el número de noches y se aplica
 * el descuento interno del paquete. Luego, si es temporada alta, se aplica el discountCoefficient
 * al total del paquete (evitando aplicar dos veces el descuento).
 *
 * @param {Object} pkg - Objeto que representa el paquete (debe tener "habitaciones", "noches" y "descuento").
 * @param {boolean} isHighSeason - Indica si es temporada alta.
 * @param {number} discountCoefficient - Coeficiente de descuento (por ejemplo, 0.1 para 10%).
 * @returns {Object} - Objeto con el precio original, final y el descuento aplicado.
 */
export const calculatePackageFinalPrice = (
  pkg,
  isHighSeason,
  discountCoefficient
) => {
  const noches = calcularNoches(pkg.fechaInicio, pkg.fechaFin);
  const sumRooms = (pkg.habitaciones || []).reduce(
    (sum, room) => sum + room.precio * noches,
    0
  );
  // Convertir descuento de paquete a decimal si es necesario
  let descuento = pkg.descuento || 0;
  if (descuento > 1) {
    descuento = descuento / 100;
  }
  const packageBase = sumRooms * (1 - descuento);
  const original = packageBase;
  const final = isHighSeason ? original * (1 - discountCoefficient) : original;
  return { original, final, discount: original - final };
};

/**
 * Calcula el total de la reserva, sumando los precios finales de las habitaciones y paquetes.
 *
 * @param {Array} rooms - Array de objetos Room seleccionados.
 * @param {Array} packages - Array de objetos Package seleccionados.
 * @param {boolean} isHighSeason - Indica si es temporada alta.
 * @param {number} discountCoefficient - Coeficiente de descuento (por ejemplo, 0.1 para 10%).
 * @returns {Object} - Objeto con el total original, total final y total de descuento aplicado.
 */
export const calculateReservationTotal = (
  rooms,
  packages,
  isHighSeason,
  discountCoefficient
) => {
  const roomsResult = rooms.map((room) =>
    calculateRoomFinalPrice(room, isHighSeason, discountCoefficient)
  );
  const packagesResult = packages.map((pkg) =>
    calculatePackageFinalPrice(pkg, isHighSeason, discountCoefficient)
  );

  const totalOriginal =
    roomsResult.reduce((sum, r) => sum + r.original, 0) +
    packagesResult.reduce((sum, p) => sum + p.original, 0);
  const totalFinal =
    roomsResult.reduce((sum, r) => sum + r.final, 0) +
    packagesResult.reduce((sum, p) => sum + p.final, 0);
  const totalDiscount = totalOriginal - totalFinal;

  return { totalOriginal, totalFinal, totalDiscount };
};

// Calcula la cantidad de noches entre dos fechas
export function calcularNoches(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin - inicio);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calcula el precio total de una habitación
export function calcularPrecioHabitacion(habitacion) {
  const noches = calcularNoches(habitacion.fechaInicio, habitacion.fechaFin);
  return habitacion.precio * noches;
}

// Calcula el precio total de un paquete (puede tener varias habitaciones y descuento)
export function calcularPrecioPaquete(paquete) {
  const noches = calcularNoches(paquete.fechaInicio, paquete.fechaFin);
  const totalHabitaciones = (paquete.habitaciones || []).reduce(
    (acc, hab) => acc + hab.precio * noches,
    0
  );
  // Convertir descuento de paquete a decimal si es necesario
  let descuento = paquete.descuento || 0;
  if (descuento > 1) {
    descuento = descuento / 100;
  }
  return totalHabitaciones * (1 - descuento);
}
