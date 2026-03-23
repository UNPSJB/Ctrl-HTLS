import { X, Plus } from 'lucide-react';
import { 
  SelectInput, 
  NumberInput 
} from '@form';

// Selector interactivo para asociar tipos de habitación y precios a un hotel
const TiposHabitacionSelector = ({
  tiposHabitaciones = [],
  tiposSeleccionados,
  selectedTipo,
  setSelectedTipo,
  precioTemporal,
  setPrecioTemporal,
  onAgregar,
  onRemover,
  canAdd,
  loading = false,
  errors = {},
}) => {

  const getTipoHabitacionNombre = (id) => {
    return (
      tiposHabitaciones.find((tipo) => tipo.id == id)?.nombre || ''
    );
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(precio);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
        <div className="h-4 w-1 rounded-full bg-blue-600"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Tipos de Habitaciones
        </h3>
      </div>

      <div className="space-y-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Agregar Tipos de Habitaciones con Precios <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider dark:text-gray-400">
              Tipo de Habitación
            </label>
            <SelectInput
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              disabled={loading}
            >
              <option value="">
                {loading ? 'Cargando tipos...' : 'Seleccionar tipo'}
              </option>
              {tiposHabitaciones.map((tipo) => (
                <option
                  key={tipo.id}
                  value={tipo.id}
                  disabled={tiposSeleccionados.some(
                    (t) => t.id === Number.parseInt(tipo.id)
                  )}
                >
                  {tipo.nombre}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider dark:text-gray-400">
              Precio por Noche
            </label>
            <NumberInput
              placeholder="Ej: 50000"
              value={precioTemporal}
              onChange={(e) => setPrecioTemporal(e.target.value)}
              disabled={loading}
              min="0"
              icon={true}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={onAgregar}
              disabled={!canAdd || loading}
              className={`w-full px-4 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${canAdd && !loading
                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                }`}
            >
              <Plus className="h-5 w-5" />
              {loading ? '...' : 'Agregar'}
            </button>
          </div>
        </div>

        {errors.tiposHabitaciones && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-600 text-sm font-medium dark:text-red-400">
              {errors.tiposHabitaciones.message}
            </p>
          </div>
        )}

        { }
        {tiposSeleccionados.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Tipos de Habitaciones Agregados:
            </label>
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg dark:bg-gray-700/50">
              {tiposSeleccionados.map((tipo) => (
                <div
                  key={tipo.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded font-medium dark:bg-gray-700 dark:text-gray-200">
                      {getTipoHabitacionNombre(tipo.id)}
                    </span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatearPrecio(tipo.precio)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemover(tipo.id)}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-100 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        { }
        {tiposSeleccionados.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-900/30">
            <p className="text-yellow-800 text-sm dark:text-yellow-200">
              <strong>Nota:</strong> Debe agregar al menos un tipo de habitación
              con su precio antes de registrar el hotel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiposHabitacionSelector;
