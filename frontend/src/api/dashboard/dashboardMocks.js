/**
 * Datos ficticios para el Dashboard.
 *
 * Estos mocks representan los endpoints pendientes de implementación en el backend.
 * Cuando estén disponibles, reemplazar con llamadas reales a la API.
 *
 * TODO: Conectar con endpoint real cuando el backend lo provea.
 */

export const MOCK_TOP_VENDEDORES = [
  { nombre: 'Valentina', apellido: 'Romero',   montoTotal: 187500, cantidadVentas: 25 },
  { nombre: 'Lucas',     apellido: 'Ferreyra', montoTotal: 152300, cantidadVentas: 41 },
  { nombre: 'Camila',    apellido: 'Ríos',     montoTotal: 134000, cantidadVentas: 29 },
  { nombre: 'Matías',    apellido: 'Sosa',     montoTotal: 98700,  cantidadVentas: 35 },
  { nombre: 'Florencia', apellido: 'Paz',      montoTotal: 76400,  cantidadVentas: 17 },
];

export const MOCK_TOP_HOTELES = [
  { nombre: 'Hotel Patagonia Sur',   montoTotal: 312000, cantidadVentas: 37 },
  { nombre: 'Residencia del Lago',   montoTotal: 248500, cantidadVentas: 58 },
  { nombre: 'Grand Palace Córdoba',  montoTotal: 195000, cantidadVentas: 46 },
  { nombre: 'Posada Las Lomas',      montoTotal: 143200, cantidadVentas: 19 },
  { nombre: 'Hotel Río Gallegos',    montoTotal: 98600,  cantidadVentas: 28 },
];

/**
 * Genera datos ficticios de ventas mensuales para el año actual.
 * Cuando el backend provea este endpoint, reemplazar con la llamada real.
 */
export const getMockVentasAnuales = () => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mesActual = new Date().getMonth(); // 0-indexed

  return meses.map((mes, idx) => ({
    mes,
    // Solo generar datos hasta el mes actual, el resto va en 0
    total: idx <= mesActual
      ? Math.floor(Math.random() * 300000) + 50000
      : 0,
  }));
};
