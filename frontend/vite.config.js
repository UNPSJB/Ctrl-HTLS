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
      '@layouts': resolve(__dirname, './src/modules/vendor/layout'), // Alias para layouts vendor
      '@pages': resolve(__dirname, './src/modules/vendor/pages'), // Alias para páginas vendor
      '@routes': resolve(__dirname, './src/routes'), // Alias para rutas
      '@modules': resolve(__dirname, './src/modules'), // Alias para módulos
      '@hotel': resolve(__dirname, './src/modules/vendor/components/hotel'), // Alias para componentes de hotel vendor
      '@admin-ui': resolve(__dirname, './src/modules/admin/shared/components/ui'), // Alias para componentes UI admin
      '@admin-context': resolve(__dirname, './src/modules/admin/shared/context'), // Alias para contextos admin
      '@client': resolve(__dirname, './src/modules/vendor/components/client'), // Alias para componentes de cliente
      '@cart': resolve(__dirname, './src/modules/vendor/components/cart'), // Alias para componentes de carrito vendor
      '@data': resolve(__dirname, './src/data'), // Alias para datos
      '@checkout': resolve(__dirname, './src/modules/vendor/components/checkout'), // Alias para componentes de checkout vendor
      '@vendor-context': resolve(__dirname, './src/modules/vendor/context'), // Alias para contextos vendor
      '@vendor-hooks': resolve(__dirname, './src/modules/vendor/hooks'), // Alias para hooks vendor
      '@admin-hooks': resolve(__dirname, './src/modules/admin/shared/hooks'), // Alias para hooks admin
      '@form': resolve(__dirname, './src/components/ui/form'),
    },
  },
});
