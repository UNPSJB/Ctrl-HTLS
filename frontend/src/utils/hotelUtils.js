/**
 * Archivo: hotelUtils.js
 * Descripción: Contiene funciones de utilidad para calcular precios de habitaciones y paquetes turísticos,
 * aplicando descuentos y coeficientes de temporada.
 */

/**
 * Calcula el total a pagar por las habitaciones seleccionadas.
 * Aplica el coeficiente de descuento en caso de temporada alta.
 *
 * @param {string[]} selectedRooms - Lista de nombres de habitaciones seleccionadas.
 * @param {Object[]} habitaciones - Lista de habitaciones del hotel.
 * @param {number} coeficiente - Coeficiente de descuento en temporada alta.
 * @returns {number} - Total calculado de las habitaciones seleccionadas.
 */
export const calculateRoomsTotal = (
  selectedRooms,
  habitaciones,
  coeficiente
) => {
  return habitaciones
    .filter((hab) => selectedRooms.includes(hab.nombre))
    .reduce((acc, hab) => {
      const effectivePrice =
        coeficiente !== 1 ? hab.precio * (1 - coeficiente) : hab.precio;
      return acc + effectivePrice;
    }, 0);
};

/**
 * Calcula el total a pagar por los paquetes seleccionados.
 * Aplica el coeficiente de descuento en caso de temporada alta.
 *
 * @param {string[]} selectedPackages - Lista de nombres de paquetes seleccionados.
 * @param {Object[]} paquetes - Lista de paquetes turísticos del hotel.
 * @param {number} coeficiente - Coeficiente de descuento en temporada alta.
 * @returns {number} - Total calculado de los paquetes seleccionados.
 */
export const calculatePackagesTotal = (
  selectedPackages,
  paquetes,
  coeficiente
) => {
  return paquetes
    .filter((paq) => selectedPackages.includes(paq.nombre))
    .reduce((acc, paquete) => {
      // Calcula el precio base del paquete aplicando su descuento propio
      const packageBasePrice =
        paquete.habitaciones.reduce((sum, hab) => sum + hab.precio, 0) *
        (1 - paquete.descuento / 100);

      // Aplica el coeficiente adicional si es temporada alta
      const effectivePrice =
        coeficiente !== 1
          ? packageBasePrice * (1 - coeficiente)
          : packageBasePrice;

      return acc + effectivePrice;
    }, 0);
};
