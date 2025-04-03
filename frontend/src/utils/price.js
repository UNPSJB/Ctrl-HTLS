// Función para calcular el precio final aplicando el coeficiente de descuento
export const applySeasonDiscount = (price, discountCoefficient) => {
  // Si discountCoefficient es distinto de 1, aplica el descuento
  return discountCoefficient !== 1 ? price * (1 - discountCoefficient) : price;
};
