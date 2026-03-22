import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { InnerLoading } from '@/components/ui/InnerLoading';

// Detalle de ventas y liquidaciones de un vendedor
const VendedorLiquidaciones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [vendedor, setVendedor] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);

  const [activeTab, setActiveTab] = useState('resumen');

  // Filtro de estado para historial de ventas y pagos
  const [filtroVentas, setFiltroVentas] = useState('todos');

  // Cálculos derivados
  const pendingSales = ventas.filter((v) => !v.liquidacionId);
  const pendingAmount = pendingSales.reduce((acc, curr) => acc + Number(curr.subtotal), 0) * 0.02;
  const totalPaid = liquidaciones.reduce((acc, curr) => acc + Number(curr.total), 0);

  // Ventas filtradas
  const ventasFiltradas = ventas.filter((v) => {
    if (filtroVentas === 'pendiente') return !v.liquidacionId;
    if (filtroVentas === 'pagado') return !!v.liquidacionId;
    return true;
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      setVendedor(response.data);
      setVentas(response.data.ventas || []);
      setLiquidaciones(response.data.liquidaciones || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidar = async () => {
    const start = document.getElementById('liq-start').value;
    const end = document.getElementById('liq-end').value;

    if (!start || !end) {
      toast.error('Por favor seleccione un rango de fechas');
      return;
    }
    if (!window.confirm('¿Está seguro de generar la liquidación para este periodo?')) return;

    try {
      setLoadingAction(true);
      await axiosInstance.post(`/liquidaciones/liquidar/${id}`, {
        fechaInicio: start,
        fechaFin: end,
      });
      toast.success('Liquidación generada correctamente');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al generar liquidación');
    } finally {
      setLoadingAction(false);
    }
  };

  const TABS = [
    { id: 'resumen', label: 'Resumen y Liquidar' },
    { id: 'ventas', label: 'Historial de Ventas' },
    { id: 'pagos', label: 'Historial de Pagos' },
  ];

  return (
    <div className="space-y-6">

      {/* Encabezado con Datos del Vendedor */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => navigate('/admin/personal/vendedores')}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white min-h-[32px]">
            {loading && !vendedor ? (
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ) : (
              `Liquidaciones: ${vendedor?.nombre} ${vendedor?.apellido}`
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {vendedor ? `${vendedor.tipoDocumento}: ${vendedor.numeroDocumento}` : 'Obteniendo información...'}
          </p>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl px-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading && !vendedor}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors disabled:opacity-50 ${
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

      {/* Contenido de Pestañas */}
      <div className="min-h-[400px]">
        {loading && !vendedor ? (
          <InnerLoading message="Cargando datos de liquidación..." />
        ) : (
          <div className="animate-in fade-in duration-500 space-y-6">

            {/* ─── PESTAÑA: Resumen y Liquidar ─── */}
            {activeTab === 'resumen' && (
              <>
                {/* Cards de resumen */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Ventas pendientes (cantidad) */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ventas Pendientes</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingSales.length}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Monto pendiente */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto Pendiente</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${pendingAmount.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Total liquidado */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Liquidado</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalPaid.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Liquidaciones generadas */}
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Liquidaciones</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{liquidaciones.length}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel para generar nueva liquidación */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                  <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generar Nueva Liquidación</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Seleccione el periodo para calcular y registrar las comisiones pendientes.
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Fecha Inicio
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="liq-start"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Fecha Fin
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="liq-end"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleLiquidar}
                        disabled={loadingAction || pendingSales.length === 0}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
                      >
                        <DollarSign className="h-4 w-4" />
                        {loadingAction ? 'Procesando...' : 'Liquidar Periodo'}
                      </button>
                    </div>
                    {pendingSales.length === 0 && (
                      <p className="mt-4 text-xs text-center text-gray-400 italic">
                        No hay ventas pendientes para liquidar.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ─── PESTAÑA: Historial de Ventas ─── */}
            {activeTab === 'ventas' && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Ventas</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ventas.length} ventas totales</p>
                  </div>
                  {/* Filtro de estado */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    <select
                      value={filtroVentas}
                      onChange={(e) => setFiltroVentas(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3 text-right">Monto Venta</th>
                        <th className="px-4 py-3 text-right">Comisión (2%)</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {ventasFiltradas.length > 0 ? (
                        ventasFiltradas.map((v) => (
                          <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-2.5 text-xs font-mono text-gray-400">#{v.id}</td>
                            <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{v.descripcion}</td>
                            <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">
                              ${Number(v.subtotal).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">
                              ${(Number(v.subtotal) * 0.02).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {v.liquidacionId ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle2 className="h-3 w-3" /> Pagado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  <AlertCircle className="h-3 w-3" /> Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                            No hay ventas{filtroVentas !== 'todos' ? ` con estado "${filtroVentas}"` : ''}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── PESTAÑA: Historial de Pagos ─── */}
            {activeTab === 'pagos' && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex flex-col gap-1 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Pagos</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{liquidaciones.length} liquidaciones totales</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Nro.</th>
                        <th className="px-4 py-3">Fecha de Liquidación</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {liquidaciones.length > 0 ? (
                        liquidaciones.map((l) => (
                          <tr key={l.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                              #{l.numero}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {new Date(l.fechaEmision).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-green-600 dark:text-green-400">
                              ${Number(l.total).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" /> Pagado
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                            Sin historial de liquidaciones.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default VendedorLiquidaciones;
