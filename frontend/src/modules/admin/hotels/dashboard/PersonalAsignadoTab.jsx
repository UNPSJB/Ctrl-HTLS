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
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PersonalAsignadoList from '../components/PersonalAsignadoList';
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
    <div className="animate-in fade-in space-y-8 duration-300">
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

        {!isAssigning && (
          <button
            onClick={() => setIsAssigning(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" /> Autorizar Nuevo Vendedor
          </button>
        )}
      </div>

      {/* Panel de búsqueda y selección */}
      {isAssigning && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/30 dark:bg-blue-900/10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                <Search className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Buscar Vendedor
              </h3>
            </div>
            <button
              onClick={() => {
                setIsAssigning(false);
                setSelectedVendedor(null);
                setSearchTerm('');
              }}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input de búsqueda con dropdown */}
            <div className="relative">
              <SearchInput
                placeholder="Buscar por DNI, Nombre o Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm.length >= 2 && !selectedVendedor && (
                <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  {filteredSearch.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
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
                          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
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

            {/* Tarjeta de vendedor seleccionado */}
            <div className="flex items-center justify-center">
              {selectedVendedor ? (
                <div className="animate-in zoom-in-95 flex w-full items-center justify-between rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900 dark:text-green-300">
                        {selectedVendedor.nombre} {selectedVendedor.apellido}
                      </h4>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        DNI: {selectedVendedor.numeroDocumento}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAsignar}
                    disabled={loadingAction}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Confirmar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <AlertCircle className="h-5 w-5 opacity-40" />
                  <p className="text-xs italic">
                    Busque y seleccione un vendedor para ver sus detalles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de asignados */}
      <PersonalAsignadoList
        data={asignados}
        loading={loading}
        loadingAction={loadingAction}
        onDesasignar={handleDesasignar}
      />
    </div>
  );
}
