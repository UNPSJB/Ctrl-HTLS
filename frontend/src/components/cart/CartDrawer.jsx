// src/components/cart/CartDrawer.jsx
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@context/CarritoContext';
import CartHeader from './CartHeader';
import HotelCartSection from './HotelCartSection';
import CartFooter from './CartFooter';

function CartDrawer({ isOpen, onClose }) {
  const { carrito, totalElementos } = useCarrito();
  const navigate = useNavigate();

  const isEmpty = Number(totalElementos ?? 0) === 0;

  // 1) Efecto que cierra si se intenta abrir pero está vacío
  useEffect(() => {
    if (isOpen && isEmpty) {
      onClose?.();
    }
  }, [isOpen, isEmpty, onClose]);

  // 2) Efecto para lock scroll y escuchar Escape
  // -> Lo llamamos siempre, pero dentro salimos si no está abierto o está vacío.
  useEffect(() => {
    if (!isOpen || isEmpty) return; // evita side-effects cuando no está visible

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen, isEmpty, onClose]);

  // 3) Callback para navegar (también declarado siempre)
  const handleNavigateToReservation = useCallback(() => {
    onClose?.();
    navigate('/reserva');
  }, [navigate, onClose]);

  // Si no está abierto o está vacío, no renderizamos nada (evita parpadeos)
  if (!isOpen || isEmpty) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform text-gray-900 dark:text-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex flex-col h-full">
          <CartHeader onClose={onClose} />

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {(carrito.hoteles || []).map((hotel) => (
              <HotelCartSection
                key={hotel.idHotel ?? hotel.nombre}
                hotel={hotel}
              />
            ))}
          </div>

          <CartFooter
            hotels={carrito?.hoteles ?? []}
            onClose={handleNavigateToReservation}
          />
        </div>
      </aside>
    </div>
  );
}

export default CartDrawer;
