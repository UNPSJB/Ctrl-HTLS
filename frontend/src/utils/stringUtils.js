/**
 * Utilidades para manipulación de cadenas de texto (strings).
 */

/**
 * Retorna el string con la primera letra en mayúscula y el resto en minúsculas.
 * Ideal para normalizar nombres que vienen en minúsculas desde el backend.
 * @param {string} str - El string a capitalizar.
 * @returns {string} El string con la primera letra en mayúscula.
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  const lower = str.toString().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Capitaliza cada palabra de un string (Title Case).
 * @param {string} str - El string a capitalizar.
 * @returns {string} El string capitalizado por palabras.
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.toString()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
