import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { BusquedaProvider } from '@context/BusquedaContext';
import { ClienteProvider } from '@context/ClienteContext';
import { PagoProvider } from '@context/PagoContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <BusquedaProvider>
        <CarritoProvider>
          <ClienteProvider>
            <PagoProvider>
              <AppRouter />
            </PagoProvider>
          </ClienteProvider>
        </CarritoProvider>
      </BusquedaProvider>
    </ThemeProvider>
  );
}

export default App;
