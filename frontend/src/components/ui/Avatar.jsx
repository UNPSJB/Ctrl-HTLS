import { useAuth } from '@/context/AuthContext';

// Componente para mostrar el alias circular del usuario
const Avatar = ({ className = "h-9 w-9" }) => {
  const { user } = useAuth();
  const inicial = user?.nombre?.charAt(0).toUpperCase() || 'U';

  return (
    // Contenedor del avatar con gradiente
    <div className={`flex items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-blue-600 to-blue-400 text-sm font-bold text-white shadow-md dark:border-gray-700 ${className}`}>
      {inicial}
    </div>
  );
};

export default Avatar;
