import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import { BusquedaProvider } from '@context/BusquedaContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <BusquedaProvider>
        <CarritoProvider>
          <AppRouter />
        </CarritoProvider>
      </BusquedaProvider>
    </ThemeProvider>
  );
}

export default App;
