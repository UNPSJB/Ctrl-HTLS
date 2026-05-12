/**
 * Utilidades para manejo y conversión de archivos PDF.
 * Soporta tanto strings en Base64 como objetos Blob binarios.
 */

/**
 * Recibe los datos de un PDF (Base64 o Blob) y fuerza su visualización/descarga.
 * 
 * @param {string|Blob} data - Los datos del PDF (string Base64 o Blob binario)
 * @param {string} fileName - Nombre que tendrá el archivo descargado
 */
export const downloadBase64PDF = (data, fileName = 'Documento.pdf') => {
  if (!data) throw new Error('No se proporcionaron datos para el PDF');

  let blob;

  if (data instanceof Blob) {
    // Caso 1: Los datos ya son un binario (Blob)
    blob = data;
  } else if (typeof data === 'string') {
    // Caso 2: Es un string (probablemente Base64)
    
    // Limpiar prefijo data URL si existe (ej: data:application/pdf;base64,...)
    const base64Content = data.includes(',') ? data.split(',')[1] : data;
    
    try {
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'application/pdf' });
    } catch (e) {
      console.error('Error decodificando Base64:', e);
      throw new Error('El formato del documento no es un Base64 válido');
    }
  } else {
    throw new Error('Tipo de dato no soportado para PDF');
  }

  // Crear URL y procesar descarga/apertura
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Abrir en nueva pestaña
  window.open(url, '_blank');

  // Limpiar memoria
  setTimeout(() => window.URL.revokeObjectURL(url), 2000);
};
