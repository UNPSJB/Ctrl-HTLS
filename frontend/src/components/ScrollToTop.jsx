import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Componente que resetea el scroll al tope de la página al cambiar de ruta
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
