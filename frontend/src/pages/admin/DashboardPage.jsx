import { Building2 } from 'lucide-react';

function DashboardPage() {
  const adminUser = {
    nombre: 'Carlos Rodríguez',
  };

  return (
    <div className="p-6">
      {/* Bienvenida */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido, {adminUser.nombre}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Panel de administración del sistema de hoteles
        </p>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ejemplo de card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Hoteles
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                24
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            +2 este mes
          </p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                Crear Hotel
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agregar nuevo hotel
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
