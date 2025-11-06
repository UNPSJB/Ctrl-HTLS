import { FileText, Check } from 'lucide-react';
import { useState } from 'react'; // 1. Importar useState

// Opciones de factura
const tiposFactura = [
  { id: 'A', label: 'Factura A', description: 'Responsable Inscripto' },
  { id: 'B', label: 'Factura B', description: 'Consumidor Final' },
  { id: 'C', label: 'Factura C', description: 'Monotributista' },
];

// 2. ELIMINAMOS las props de estado (selectedType, onChange)
function FacturaSelector({ disabled = false }) {
  // 3. AÑADIMOS estado interno
  const [selectedType, setSelectedType] = useState('B');

  const handleSelect = (id) => {
    // 4. Usa el setter local
    if (!disabled) {
      setSelectedType(id);
    }
  };

  return (
    <fieldset className="mt-4" aria-label="Tipo de Factura">
      <legend className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        <FileText className="h-4 w-4" />
        Tipo de Factura
      </legend>

      <div className="space-y-2" role="radiogroup">
        {tiposFactura.map((tipo) => (
          <label
            key={tipo.id}
            onClick={() => handleSelect(tipo.id)}
            className={`flex cursor-pointer select-none items-center gap-3 rounded-lg border p-3 transition-colors ${
              selectedType === tipo.id // 5. Usa el estado local
                ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-900'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              id={`factura-${tipo.id}`}
              type="radio"
              name="facturaTipo"
              value={tipo.id}
              checked={selectedType === tipo.id} // 6. Usa el estado local
              onChange={() => handleSelect(tipo.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
              aria-label={`${tipo.label}: ${tipo.description}`}
            />

            {/* Contenido visible */}
            <div className="flex flex-1 items-baseline">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {tipo.label}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({tipo.description})
              </span>
            </div>

            {selectedType === tipo.id && ( // 7. Usa el estado local
              <Check className="h-4 w-4 text-green-600" />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default FacturaSelector;
