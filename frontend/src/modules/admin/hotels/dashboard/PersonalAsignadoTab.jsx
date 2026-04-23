import { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Search,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { capitalizeFirst } from '@/utils/stringUtils';
import PersonalAsignadoList from '../components/PersonalAsignadoList';
import { PageHeader, Modal } from '@admin-ui';
import { SearchInput } from '@form';
import AppButton from '@/components/ui/AppButton';

/**
 * Gestión de personal (vendedores) asignados a un hotel específico.
 * Componente autónomo: carga su propia lista de asignados desde getHotelById.
 */
export default function PersonalAsignadoTab({ hotelId, isActive = false }) {
  const [asignados, setAsignados] = useState([]);
  const [todosVendedores, setTodosVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState(null);

  // Carga inicial de asignados al montar o cambiar hotelId / activar pestaña
  useEffect(() => {
    if (isActive) {
      fetchAsignados();
    }
  }, [hotelId, isActive]);

  // Cargar lista de todos los vendedores solo cuando se abre el modo asignación
  useEffect(() => {
    if (isAssigning) {
      fetchTodosVendedores();
    }
  }, [isAssigning]);

  const fetchAsignados = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/hotel/${hotelId}`);
      setAsignados(data.vendedores || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el personal asignado');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosVendedores = async () => {
    try {
      const res = await axiosInstance.get('/vendedores');
      setTodosVendedores(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la lista de vendedores');
    }
  };

  const handleAsignar = async () => {
    if (!selectedVendedor) return;
    try {
      setLoadingAction(true);
      await axiosInstance.post('/hotel/asignar-empleado', {
        hotelId: Number(hotelId),
        vendedorId: Number(selectedVendedor.id),
      });
      toast.success('Vendedor asignado correctamente');
      setIsAssigning(false);
      setSelectedVendedor(null);
      setSearchTerm('');
      await fetchAsignados(); // Recarga solo la lista de asignados
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al asignar vendedor');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDesasignar = async (vendedorId) => {
    if (!window.confirm('¿Confirma remover este vendedor de la lista?')) return;
    try {
      setLoadingAction(true);
      await axiosInstance.post('/hotel/desasignar-empleado', {
        hotelId: Number(hotelId),
        vendedorId: Number(vendedorId),
      });
      toast.success('Acceso revocado correctamente');
      await fetchAsignados(); // Recarga solo la lista de asignados
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al remover vendedor');
    } finally {
      setLoadingAction(false);
    }
  };

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


  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-500" />
            Personal de Ventas Autorizado
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Solo los vendedores listados aquí podrán realizar alquileres en este hotel.
          </p>
        </div>

        <AppButton
          onClick={() => setIsAssigning(true)}
          disabled={loading}
          icon={UserPlus}
        >
          Autorizar Nuevo Vendedor
        </AppButton>
      </div>

      <div className="flex-grow mt-6 flex flex-col overflow-hidden relative">

        {/* Modal de Asignación */}
        <Modal
          isOpen={isAssigning}
          onClose={() => {
            setIsAssigning(false);
            setSelectedVendedor(null);
            setSearchTerm('');
          }}
          title="Autorizar Vendedor"
          description="Busca y selecciona un vendedor para otorgarle acceso a este hotel."
          onConfirm={handleAsignar}
          confirmLabel="Autorizar Acceso"
          confirmIcon={CheckCircle2}
          loading={loadingAction}
          confirmDisabled={!selectedVendedor}
        >
          <div className="flex flex-col h-[55vh]">
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

        {/* Tabla de asignados */}
        <PersonalAsignadoList
          data={asignados}
          loading={loading}
          loadingAction={loadingAction}
          onDesasignar={handleDesasignar}
        />
      </div>
    </div>
  );
}
