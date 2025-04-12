import { ThemeProvider } from './context/ThemeContext';
import { CarritoProvider } from './context/CartContext';
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
