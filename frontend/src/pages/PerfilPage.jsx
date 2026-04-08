import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { toast } from 'react-hot-toast';
import { 
  Building2, Mail, Phone, Hash, 
  DollarSign, ShoppingBag, CheckCircle2, AlertCircle, Filter, Receipt 
} from 'lucide-react';

function PerfilPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [vendedorData, setVendedorData] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  
  const [activeTab, setActiveTab] = useState('ventas');
  const [filtroVentas, setFiltroVentas] = useState('todos');

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
      setVentas(response.data.ventas || []);
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

  const ventasFiltradas = ventas.filter((v) => {
    if (filtroVentas === 'pendiente') return !v.liquidacionId;
    if (filtroVentas === 'pagado') return !!v.liquidacionId;
    return true;
  });

  const TABS = [
    { id: 'ventas', label: 'Historial de Ventas' },
    { id: 'pagos', label: 'Liquidaciones (Cobros)' },
  ];

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        No tienes permisos para visualizar esta página.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <InnerLoading message="Obteniendo información financiera..." />
        </div>
      ) : (
        <>
          {vendedorData && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-6">
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
                  <Building2 className="h-4 w-4 text-blue-500" /> Hoteles Autorizados para Venta
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendedorData.hotelesPermitidos && vendedorData.hotelesPermitidos.length > 0 ? (
                    vendedorData.hotelesPermitidos.map(hotel => (
                      <span key={hotel.id} className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/20">
                        {capitalizeWords(hotel.nombre)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No tienes hoteles asignados actualmente.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Facturado p / Empresa</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalSalesAmount.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm dark:border-amber-900/20 dark:bg-gray-800 transition-all hover:shadow-md text-amber-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mis Ventas No Cobradas</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingSales.length} ventas</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900/20 dark:bg-gray-800 transition-all hover:shadow-md text-orange-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Comisión a mi Favor</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/20 dark:bg-gray-800 transition-all hover:shadow-md text-emerald-600">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Histórico Cobrado</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden min-h-[400px]">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-4 bg-gray-50/50 dark:bg-gray-900/20">
              <nav className="-mb-px flex space-x-8">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex flex-col items-center">
              {activeTab === 'ventas' && (
                <div className="w-full flex-1">
                  <div className="border-b border-gray-100 px-6 py-3 flex justify-between items-center dark:border-gray-700/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">Revisá el estado de los alquileres que efectuaste.</p>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                      <select
                        value={filtroVentas}
                        onChange={(e) => setFiltroVentas(e.target.value)}
                        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 font-medium"
                      >
                        <option value="todos">Todas las ventas</option>
                        <option value="pendiente">Solo Pendientes</option>
                        <option value="pagado">Ya Liquidadas</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm relative">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-4">Ref. Venta</th>
                          <th className="px-6 py-4">Detalle Comercial</th>
                          <th className="px-6 py-4 text-right">Monto Original</th>
                          <th className="px-6 py-4 text-right text-blue-600 dark:text-blue-400">Mi Parte (2%)</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {ventasFiltradas.length > 0 ? (
                          ventasFiltradas.map((v) => (
                            <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-6 py-3.5 text-xs font-mono text-gray-500">#{String(v.id).padStart(5, '0')}</td>
                              <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white capitalize">{v.descripcion}</td>
                              <td className="px-6 py-3.5 text-right text-gray-600 dark:text-gray-300">${Number(v.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-3.5 text-right font-medium text-gray-900 dark:text-gray-200">${(Number(v.subtotal) * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-3.5 text-center">
                                {v.liquidacionId ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Liquidado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                                    <AlertCircle className="h-3.5 w-3.5" /> Pendiente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No tienes datos.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'pagos' && (
                <div className="w-full flex-1">
                  <div className="border-b border-gray-100 px-6 py-3 dark:border-gray-700/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">Comprobantes de comisiones emitidas a tu favor.</p>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm relative">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/80 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-4">Nro. Liquidación</th>
                          <th className="px-6 py-4">Fecha de Emisión</th>
                          <th className="px-6 py-4 text-right">Monto Percibido</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {liquidaciones.length > 0 ? (
                          liquidaciones.map((l) => (
                            <tr key={l.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-6 py-3.5 text-xs font-mono font-medium text-gray-600 dark:text-gray-400">#{l.numero}</td>
                              <td className="px-6 py-3.5 text-gray-900 dark:text-white">{new Date(l.fechaEmision).toLocaleDateString('es-AR')}</td>
                              <td className="px-6 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">${Number(l.total).toLocaleString()}</td>
                              <td className="px-6 py-3.5 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No hay pagos registrados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
