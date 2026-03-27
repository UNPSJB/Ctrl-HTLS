import { useState, useEffect } from 'react';
import {
  UserPlus,
  Trash2,
  X,
  Users,
  Search,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PersonalAsignadoList from '../components/PersonalAsignadoList';
import { PageHeader, ActionModal } from '@admin-ui';
import { SearchInput } from '@form';

/**
 * Gestión de personal (vendedores) asignados a un hotel específico.
 * Componente autónomo: carga su propia lista de asignados desde getHotelById.
 */
export default function PersonalAsignadoTab({ hotelId }) {
  const [asignados, setAsignados] = useState([]);
  const [todosVendedores, setTodosVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState(null);

  // Carga inicial de asignados al montar o cambiar hotelId
  useEffect(() => {
    fetchAsignados();
  }, [hotelId]);

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
    <div className="animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-500" />
            Personal de Ventas Autorizado
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Solo los vendedores listados aquí podrán realizar alquileres en este hotel.
          </p>
        </div>

        <button
          onClick={() => setIsAssigning(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" /> Autorizar Nuevo Vendedor
        </button>
      </div>

      <div className="mt-8">

      {/* Modal de Asignación */}
      <ActionModal
        isOpen={isAssigning}
        onClose={() => {
          setIsAssigning(false);
          setSelectedVendedor(null);
          setSearchTerm('');
        }}
        onConfirm={handleAsignar}
        confirmLabel="Autorizar Acceso"
        confirmIcon={CheckCircle2}
        loading={loadingAction}
        confirmDisabled={!selectedVendedor}
      >
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Buscar por DNI, Nombre o Email</span>
            </div>
            <SearchInput
              placeholder="Ej: 12345678 o Juan Pérez..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12"
              autoFocus
            />

            {searchTerm.length >= 2 && (
              <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredSearch.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 italic">
                    <Users className="mx-auto h-8 w-8 opacity-20 mb-2" />
                    No se encontraron vendedores disponibles
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredSearch.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVendedor(v);
                          setSearchTerm('');
                        }}
                        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                          {v.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {v.nombre} {v.apellido}
                          </p>
                          <p className="text-xs text-gray-500">
                            DNI: {v.numeroDocumento} • {v.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="min-h-[120px] flex items-center justify-center">
            {selectedVendedor ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 w-full space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {selectedVendedor.nombre} {selectedVendedor.apellido}
                    </h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Información del Vendedor Seleccionado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase">Documento</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      {selectedVendedor.tipoDocumento?.toUpperCase()}: {selectedVendedor.numeroDocumento}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase">Email Contacto</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedVendedor.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase">Teléfono</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedVendedor.telefono || 'No registrado'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase">Dirección</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{selectedVendedor.direccion || 'No registrada'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
                <AlertCircle className="h-8 w-8 opacity-20" />
                <p className="text-sm italic">
                  Busque y seleccione un vendedor para ver sus detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </ActionModal>

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
