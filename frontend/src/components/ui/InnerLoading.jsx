
// Spinner de carga para uso dentro de contenedores (no bloquea toda la pantalla)
export const InnerLoading = ({ message = 'Cargando...' }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
        </div>
    );
};
