import { useContext, useMemo } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import logoLight from '@/assets/logo.svg';
import logoDark from '@/assets/logo-dark.svg';

// Spinner de carga con el logo del proyecto para uso dentro de contenedores
export const InnerLoading = ({ message = 'Cargando...' }) => {
    const { theme } = useContext(ThemeContext);

    const logo = useMemo(
        () => (theme === 'dark' ? logoDark : logoLight),
        [theme]
    );

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[300px] w-full animate-in fade-in duration-500">
            <div className="relative mb-6">
                {/* Logo con animación de pulso */}
                <div className="relative z-10 animate-pulse transition-all duration-1000">
                    <img src={logo} alt="Cargando..." className="h-16 w-auto opacity-80" />
                </div>
                {/* Aura decorativa (opcional, para dar más presencia) */}
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide animate-pulse">
                {message}
            </p>
        </div>
    );
};
