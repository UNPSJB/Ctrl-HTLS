import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
