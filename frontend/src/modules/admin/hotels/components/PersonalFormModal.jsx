import { useState, useEffect } from 'react';
import {
  Search,
  User,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { capitalizeFirst } from '@/utils/stringUtils';
import { Modal } from '@admin-ui';
import { SearchInput } from '@form';

/**
 * Modal para buscar y seleccionar un vendedor a asignar al hotel.
 */
export default function PersonalFormModal({
  isOpen,
  onClose,
  asignados = [],
  todosVendedores = [],
  onSave,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState(null);

  // Resetear al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedVendedor(null);
    }
  }, [isOpen]);

  // Filtro de búsqueda: excluye ya asignados y requiere al menos 2 caracteres
  const filteredSearch = todosVendedores.filter((v) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${v.nombre} ${v.apellido}`.toLowerCase();
    const doc = v.numeroDocumento?.toString() || '';
    const email = v.email?.toLowerCase() || '';
    const yaAsignado = asignados.some((a) => Number(a.empleadoId) === Number(v.id));
    return (
      !yaAsignado &&
      searchTerm.length >= 2 &&
      (fullName.includes(term) || doc.includes(term) || email.includes(term))
    );
  });

  const handleConfirm = () => {
    if (selectedVendedor) {
      onSave(selectedVendedor);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Autorizar Vendedor"
      description="Busca y selecciona un vendedor para otorgarle acceso a este hotel."
      onConfirm={handleConfirm}
      confirmLabel="Confirmar"
      loading={loading}
      confirmDisabled={!selectedVendedor}
    >
      <div className="flex flex-col h-[38vh]">
        <div className="flex-shrink-0 pb-4">
          <SearchInput
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pb-2">
          {filteredSearch.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 italic space-y-3 animate-in fade-in">
              {searchTerm.length < 2 ? (
                <>
                  <Search className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Escriba al menos 2 caracteres para buscar</p>
                </>
              ) : (
                <>
                  <Users className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No se encontraron vendedores disponibles</p>
                </>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
              {filteredSearch.map((v) => {
                const isSelected = selectedVendedor?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVendedor(v)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm dark:bg-blue-500/10 dark:border-blue-500'
                      : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${isSelected ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                          }`}>
                          {capitalizeFirst(v.nombre)} {capitalizeFirst(v.apellido)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
                            DNI {v.numeroDocumento}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {v.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pl-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
