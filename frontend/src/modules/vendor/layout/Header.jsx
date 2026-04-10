import { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LogOut, AlertTriangle } from 'lucide-react';
import { capitalizeWords } from '@/utils/stringUtils';
import Modal from '@/components/ui/Modal';
import { useCarrito } from '@vendor-context/CarritoContext';

import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme } = useContext(ThemeContext);
  const { reservaConfirmada, cancelarReserva } = useCarrito();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logo = useMemo(
    () => (theme === 'dark' ? logoDark : logoLight),
    [theme]
  );

  const handleLogoutClick = () => {
    if (reservaConfirmada && reservaConfirmada.length > 0) {
      setShowLogoutModal(true);
    } else {
      logout();
    }
  };

  const handleConfirmLogout = () => {
    cancelarReserva();
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link to="/" aria-label="Ir al inicio">
              <img src={logo} alt="Logo" className="h-10" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="mx-2 h-8 w-[1px] bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center gap-4 pl-2">
              <Link 
                to="/perfil" 
                target="_blank" 
                className="group flex flex-col text-right hover:opacity-80"
              >
                <span className="text-sm font-semibold leading-none text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {capitalizeWords(`${user?.nombre || ''} ${user?.apellido || ''}`.trim())}
                </span>
                <span className="text-[11px] capitalize text-gray-500 dark:text-gray-400">
                  {user?.rol}
                </span>
              </Link>

              <button
                onClick={handleLogoutClick}
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Advertencia al cerrar sesión con reserva pendiente */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Alquiler en Curso Detectado"
        description="El sistema detectó que te encuentras en un estado de alquiler que no puede ser modificado."
        variant="amber"
        confirmIcon={AlertTriangle}
        confirmLabel="Abortar Alquiler y Salir"
        cancelLabel="Volver"
        onConfirm={handleConfirmLogout}
      >
        <div className="space-y-4 pt-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            No puedes cerrar sesión mientras mantengas lugares reservados en el sistema.
            Si decides proceder, <strong>el alquiler en curso se abortará y perderás tu progreso</strong>.
          </p>
          <p>
            Por favor, asegúrate de finalizarlo o cancelarlo explícitamente, o pulsa <strong>Abortar Alquiler y Salir</strong> para liberarlo automáticamente antes de salir.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default Header;
