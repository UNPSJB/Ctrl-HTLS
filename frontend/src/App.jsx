import { useContext } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { CarritoProvider } from '@vendor-context/CarritoContext';
import { BusquedaProvider } from '@vendor-context/BusquedaContext';
import { ClienteProvider } from '@vendor-context/ClienteContext';
import { PagoProvider } from '@vendor-context/PagoContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const { theme } = useContext(ThemeContext);

  // Paleta de colores de Tailwind:
  // Modo Claro: bg-white (#FFFFFF) y text-gray-900 (#111827)
  // Modo Oscuro: bg-gray-800 (#1F2937) y text-gray-100 (#F3F4F6)

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#F3F4F6' : '#111827',
            border:
              theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
          },
        }}
      />
      <AppRouter />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BusquedaProvider>
          <CarritoProvider>
            <ClienteProvider>
              <PagoProvider>
                <AppContent />
              </PagoProvider>
            </ClienteProvider>
          </CarritoProvider>
        </BusquedaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
