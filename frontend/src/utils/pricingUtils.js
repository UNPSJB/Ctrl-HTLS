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
  const original = room.precio;
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
  // Suma los precios de las habitaciones incluidas en el paquete
  const sumRooms = pkg.habitaciones.reduce((sum, room) => sum + room.precio, 0);
  const packageBase = sumRooms * pkg.noches * (1 - pkg.descuento / 100);
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
