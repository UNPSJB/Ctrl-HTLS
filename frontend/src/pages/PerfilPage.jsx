import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { toast } from 'react-hot-toast';
import { 
  Building2, Mail, Phone, Hash, 
  DollarSign, ShoppingBag, CheckCircle2, AlertCircle, TrendingUp, Receipt, History
} from 'lucide-react';

// Página de Perfil para Vendedores - Solo Visualización
function PerfilPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [vendedorData, setVendedorData] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  
  const [activeTab, setActiveTab] = useState('ventas');

  useEffect(() => {
    const userId = user?.id || user?.id_usuario;
    if (userId && user.rol === 'vendedor') {
      fetchVendedorData(userId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVendedorData = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      setVendedorData(response.data);
      
      // Ordenar: Ya liquidadas primero, luego las no liquidadas
      const rawVentas = response.data.ventas || [];
      const ventasOrdering = [...rawVentas].sort((a, b) => {
          if (a.liquidacionId && !b.liquidacionId) return -1;
          if (!a.liquidacionId && b.liquidacionId) return 1;
          return 0;
      });
      
      setVentas(ventasOrdering);
      setLiquidaciones(response.data.liquidaciones || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  const pendingSales = ventas.filter((v) => !v.liquidacionId);
  const totalSalesAmount = ventas.reduce((acc, curr) => acc + Number(curr.subtotal), 0);
  const pendingAmount = pendingSales.reduce((acc, curr) => acc + Number(curr.subtotal), 0) * 0.02;
  const totalPaid = liquidaciones.reduce((acc, curr) => acc + Number(curr.total), 0);

  const TABS = [
    { id: 'ventas', label: 'Historial de Ventas', icon: History },
    { id: 'pagos', label: 'Mis Liquidaciones', icon: Receipt },
  ];

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        No tienes permisos para visualizar esta página.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8 h-full flex flex-col overflow-hidden">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
           <InnerLoading message="Obteniendo información financiera..." />
        </div>
      ) : (
        <>
          {/* Encabezado de Datos Personales */}
          {vendedorData && (
            <div className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-6">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {capitalizeWords(`${vendedorData.nombre} ${vendedorData.apellido}`)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="uppercase tracking-wide">{vendedorData.tipoDocumento || 'DOC'}: {vendedorData.numeroDocumento || 'No registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{vendedorData.telefono || 'Sin teléfono'}</span>
                  </div>
                  {vendedorData.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{vendedorData.email}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" /> Hoteles Asociados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendedorData.hotelesPermitidos && vendedorData.hotelesPermitidos.length > 0 ? (
                    vendedorData.hotelesPermitidos.map(hotel => (
                      <span key={hotel.id} className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/20">
                        {capitalizeWords(hotel.nombre)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No tienes hoteles asignados.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Métricas de Resumen */}
          <div className="flex-shrink-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Facturado</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSalesAmount)}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-amber-50 bg-white p-5 shadow-sm dark:border-amber-900/10 dark:bg-gray-800 text-amber-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Ventas Pendientes</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pendingSales.length}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-orange-50 bg-white p-5 shadow-sm dark:border-orange-900/10 dark:bg-gray-800 text-orange-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Comisión por Cobrar</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(pendingAmount)}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-50 bg-white p-5 shadow-sm dark:border-emerald-900/10 dark:bg-gray-800 text-emerald-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Percibido</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Área de Tablas */}
          <div className="flex-grow flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden min-h-[300px]">
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 bg-gray-50/50 dark:bg-gray-900/20">
              <nav className="-mb-px flex space-x-8">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col">
              {activeTab === 'ventas' && (
                <div className="flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Descripción</th>
                        <th className="px-6 py-4 text-right">Monto Original</th>
                        <th className="px-6 py-4 text-right">Mi Comisión (2%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {ventas.length > 0 ? (
                        ventas.map((v) => (
                          <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">{v.descripcion}</td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(v.subtotal)}</td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(v.subtotal) * 0.02)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No se encontraron ventas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'pagos' && (
                <div className="flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Fecha de Liquidación</th>
                        <th className="px-6 py-4 text-right">Total Comisión Percibido</th>
                        <th className="px-6 py-4 text-center">Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {liquidaciones.length > 0 ? (
                        liquidaciones.map((l) => (
                          <tr key={l.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                                {new Date(l.fechaEmision).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(l.total)}</td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-mono text-xs text-gray-400">#{l.numero}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">No hay liquidaciones registradas.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilPage;
