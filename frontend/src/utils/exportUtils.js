import * as XLSX from 'xlsx';

/**
 * Exporta un array de objetos planos a un archivo Excel (.xlsx).
 *
 * @param {Array<Object>} data     - Array de objetos a exportar (ya formateados, listos para mostrar).
 * @param {Array<{key: string, label: string}>} columns - Qué campos exportar y con qué encabezado.
 * @param {string}        fileName - Nombre del archivo sin extensión.
 */
export const exportToExcel = (data, columns, fileName) => {
  // Construir las filas usando los labels como encabezados de columna
  const rows = data.map((item) =>
    Object.fromEntries(columns.map(({ key, label }) => [label, item[key] ?? '']))
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
