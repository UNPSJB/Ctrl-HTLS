import useHotel from '@/hooks/useHotel';
import { X, Plus, DollarSign } from 'lucide-react';

const TiposHabitacionSelector = ({
  tiposSeleccionados,
  selectedTipo,
  setSelectedTipo,
  precioTemporal,
  setPrecioTemporal,
  onAgregar,
  onRemover,
  canAdd,
}) => {
  const { tiposHabitaciones } = useHotel();

  const getTipoHabitacionNombre = (id) => {
    return (
      tiposHabitaciones.find((tipo) => tipo.id === id.toString())?.nombre || ''
    );
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(precio);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Tipos de Habitaciones
      </h3>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Agregar Tipos de Habitaciones con Precios *
        </label>

        {/* Selector y precio */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Tipo de Habitación
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar tipo</option>
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
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Precio por Noche
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                placeholder="50000"
                value={precioTemporal}
                onChange={(e) => setPrecioTemporal(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onAgregar}
            disabled={!canAdd}
            className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 ${
              canAdd
                ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>

        {/* Lista de tipos agregados */}
        {tiposSeleccionados.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">
              Tipos de Habitaciones Agregados:
            </label>
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              {tiposSeleccionados.map((tipo) => (
                <div
                  key={tipo.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded font-medium">
                      {getTipoHabitacionNombre(tipo.id)}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatearPrecio(tipo.precio)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemover(tipo.id)}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-100 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiposHabitacionSelector;
