import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CarritoContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <CarritoProvider>
        <AppRouter />
      </CarritoProvider>
    </ThemeProvider>
  );
}

export default App;
