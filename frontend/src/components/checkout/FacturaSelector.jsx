import { FileText } from 'lucide-react';
import { usePago } from '@context/PagoContext';

const tiposFactura = [
  { id: 'A', label: 'Factura A', description: 'Responsable Inscripto' },
  { id: 'B', label: 'Factura B', description: 'Consumidor Final' },
  { id: 'C', label: 'Factura C', description: 'Monotributista' },
];

function FacturaSelector({ disabled = false }) {
  const { tipoFactura, setTipoFactura } = usePago();

  const handleSelect = (id) => {
    if (!disabled) {
      setTipoFactura(id);
    }
  };

  // Clases comunes para el select
  const selectClasses =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 appearance-none';

  return (
    <fieldset className="mt-4" aria-label="Tipo de Factura">
      <legend className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        <FileText className="h-4 w-4" />
        Tipo de Factura
      </legend>

      <div className="relative">
        <select
          id="factura-select"
          value={tipoFactura}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={disabled}
          className={`${selectClasses} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {tiposFactura.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.label} ({tipo.description})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.69 3.63c-.533.48-1.408.48-1.94 0l-3.69-3.63c-.408-.418-.436-1.17 0-1.615z" />
          </svg>
        </div>
      </div>
    </fieldset>
  );
}

export default FacturaSelector;
