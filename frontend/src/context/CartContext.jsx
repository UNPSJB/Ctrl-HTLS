import { createContext, useState, useContext } from 'react';

// Creamos el contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useCart = () => useContext(CartContext);

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([
    // Simulado: puedes dejar esto vacío o sincronizarlo con el backend
    {
      id: 1,
      name: 'Habitación Deluxe',
      price: 200,
      image: '',
      nights: 2,
      dates: '',
    },
    {
      id: 2,
      name: 'Suite Ejecutiva',
      price: 300,
      image: '',
      nights: 1,
      dates: '',
    },
  ]);

  const totalItems = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};
