import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Define manualmente __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // Configura el alias para la carpeta src
      '@api': resolve(__dirname, './src/api'), // Alias para la carpeta api
      '@components': resolve(__dirname, './src/components'), // Alias para componentes
      '@hooks': resolve(__dirname, './src/hooks'), // Alias para hooks
      '@context': resolve(__dirname, './src/context'), // Alias para contextos
      '@utils': resolve(__dirname, './src/utils'), // Alias para utilidades
      '@assets': resolve(__dirname, './src/assets'), // Alias para assets
      '@ui': resolve(__dirname, './src/components/ui'), // Alias para componentes UI
      '@layouts': resolve(__dirname, './src/layouts'), // Alias para layouts
      '@pages': resolve(__dirname, './src/pages'), // Alias para páginas
      '@routes': resolve(__dirname, './src/routes'), // Alias para rutas
      '@hotel': resolve(__dirname, './src/components/hotel'), // Alias para componentes de hotel
      '@client': resolve(__dirname, './src/components/client'), // Alias para componentes de cliente
      '@cart': resolve(__dirname, './src/components/cart'), // Alias para componentes de carrito
      '@data': resolve(__dirname, './src/data'), // Alias para datos
    },
  },
});
