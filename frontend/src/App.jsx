import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { BusquedaProvider } from '@context/BusquedaContext';
import { ClienteProvider } from '@context/ClienteContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <BusquedaProvider>
        <CarritoProvider>
          <ClienteProvider>
            <AppRouter />
          </ClienteProvider>
        </CarritoProvider>
      </BusquedaProvider>
    </ThemeProvider>
  );
}

export default App;
