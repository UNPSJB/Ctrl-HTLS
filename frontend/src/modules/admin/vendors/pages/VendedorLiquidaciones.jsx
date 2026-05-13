import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Receipt,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader, Modal } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';
import { parseDate, startOfDay, toISODate } from '@/utils/dateUtils';
import { getDateRangeByPreset } from '@/utils/dateRangeUtils';
import { getVentasVendedor } from '@/api/ventas/ventasService';
import { getLiquidacionesVendedor } from '@/api/liquidaciones/liquidacionesService';
import { formatCurrency } from '@/utils/pricingUtils';
import { downloadBase64PDF } from '@/utils/pdfUtils';
import AppButton from '@/components/ui/AppButton';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import VentasTable from '@/modules/vendor/components/VentasTable';

// Detalle y gestión de liquidaciones de un vendedor (Administrador)
const VendedorLiquidaciones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [vendedor, setVendedor] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);

  // Estados UI
  const [activeTab, setActiveTab] = useState('pendientes');
  const [filtering, setFiltering] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    tipo: 'all',
    inicio: '',
    fin: '',
  });
  const searchAbortController = useRef(null);

  // Estado Operativo (Exclusivo Admin)
  const [selectedVentas, setSelectedVentas] = useState([]);
  const [showConfirmLiquidar, setShowConfirmLiquidar] = useState(false);

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
      setSelectedVentas([]); // Limpiar selección al recargar
    } catch (error) {
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (newFilter) => {
    // Cancelar request anterior si existe
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    searchAbortController.current = new AbortController();
    const signal = searchAbortController.current.signal;

    setFiltering(true);
    setDateFilter(newFilter);

    try {
      const { fechaInicio, fechaFin } = getDateRangeByPreset(newFilter);

      // Peticiones en paralelo con signal
      const [ventasData, liquidacionesData] = await Promise.all([
        getVentasVendedor(id, { fechaInicio, fechaFin }, { signal }),
        getLiquidacionesVendedor(id, { fechaInicio, fechaFin }, { signal })
      ]);

      setVentas(ventasData);
      setLiquidaciones(liquidacionesData);
    } catch (error) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        return; // Request ignorado (stale/abortado)
      }
      console.error(error);
      toast.error('Error al aplicar los filtros de fecha.');
    } finally {
      setFiltering(false);
    }
  };

  // --- Cálculos derivados ---
  const { pendingSales, liquidatedSales, allSales, kpis } = useMemo(() => {
    // 1. Uso directo del backend para las listas filtradas
    const filteredAllSales = [...ventas].sort((a, b) => parseDate(b.fechaVenta) - parseDate(a.fechaVenta));

    const filteredPendingSales = filteredAllSales.filter(v => !v.liquidacionId);
    const filteredLiquidatedSales = filteredAllSales.filter(v => !!v.liquidacionId);

    // 2. Cálculos Globales (Independientes del filtro de fecha para coherencia de cartera)
    // Se usa vendedor.ventas que contiene la carga inicial sin filtrar
    const baseVentas = vendedor?.ventas || [];
    const totalGlobalFacturado = baseVentas.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const totalGlobalPendiente = baseVentas.filter(v => !v.liquidacionId).reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;

    // 3. KPIs por Tab (Basados en el filtro actual)
    const facturacionFiltrada = filteredAllSales.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const montoPendienteFiltrado = filteredPendingSales.reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;
    const montoLiquidadoFiltrado = filteredLiquidatedSales.reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;

    return {
      pendingSales: filteredPendingSales,
      liquidatedSales: filteredLiquidatedSales,
      allSales: filteredAllSales,
      kpis: {
        pendientes: {
          ventasCount: filteredPendingSales.length,
          montoPendiente: montoPendienteFiltrado,
          facturacionTotal: facturacionFiltrada,
          globalPendiente: totalGlobalPendiente
        },
        liquidadas: {
          ventasCount: filteredLiquidatedSales.length,
          montoLiquidado: montoLiquidadoFiltrado,
          facturacionPeriodo: facturacionFiltrada,
          globalFacturado: totalGlobalFacturado
        },
        todas: {
          ventasCount: filteredAllSales.length,
          facturacionPeriodo: facturacionFiltrada,
          montoPendiente: montoPendienteFiltrado,
          globalFacturado: totalGlobalFacturado
        }
      }
    };
  }, [ventas, vendedor]);

  // --- Operaciones Administrativas ---
  const handleToggleSeleccion = (ventaId) => {
    setSelectedVentas((prev) =>
      prev.includes(ventaId)
        ? prev.filter((id) => id !== ventaId)
        : [...prev, ventaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVentas.length === pendingSales.length) {
      setSelectedVentas([]);
    } else {
      setSelectedVentas(pendingSales.map((v) => v.id));
    }
  };

  const handleLiquidarSeleccionadas = async () => {
    if (selectedVentas.length === 0) return;

    try {
      setLoadingAction(true);
      const response = await axiosInstance.post(`/liquidaciones/liquidar-detalles/${id}`, {
        detalleIds: selectedVentas
      });

      const { pdfBase64 } = response.data;
      if (pdfBase64) {
        const fechaStr = toISODate(new Date());
        const fileName = `Recibo_Liquidacion_Vendedor_${id}_${fechaStr}.pdf`;
        downloadBase64PDF(pdfBase64, fileName);
      }

      toast.success(`Liquidación generada correctamente (${selectedVentas.length} ventas)`);
      setShowConfirmLiquidar(false);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al procesar la liquidación');
    } finally {
      setLoadingAction(false);
    }
  };

  const TABS = [
    { id: 'pendientes', label: 'Pendientes de Liquidar', icon: DollarSign },
    { id: 'liquidadas', label: 'Ventas Liquidadas', icon: CheckCircle2 },
    { id: 'todas', label: 'Historial de Ventas', icon: History },
  ];

  const renderContextualCards = () => {
    if (activeTab === 'pendientes') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard icon={ShoppingBag} title="Ventas a Liquidar" value={kpis.pendientes.ventasCount} color="amber" />
          <KpiCard icon={DollarSign} title="Comisión Período" value={formatCurrency(kpis.pendientes.montoPendiente)} color="orange" />
          <KpiCard icon={Receipt} title="Facturación Período" value={formatCurrency(kpis.pendientes.facturacionTotal)} color="blue" />
          <KpiCard icon={Clock} title="Pendiente Global" value={formatCurrency(kpis.pendientes.globalPendiente)} color="indigo" />
        </div>
      );
    }

    if (activeTab === 'liquidadas') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard icon={CheckCircle2} title="Ventas Liquidadas" value={kpis.liquidadas.ventasCount} color="emerald" />
          <KpiCard icon={DollarSign} title="Pagado en Período" value={formatCurrency(kpis.liquidadas.montoLiquidado)} color="green" />
          <KpiCard icon={Receipt} title="Facturación Período" value={formatCurrency(kpis.liquidadas.facturacionPeriodo)} color="blue" />
          <KpiCard icon={Activity} title="Facturación Global" value={formatCurrency(kpis.liquidadas.globalFacturado)} color="purple" />
        </div>
      );
    }
    
    if (activeTab === 'todas') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard icon={History} title="Total de Ventas" value={kpis.todas.ventasCount} color="blue" />
          <KpiCard icon={BarChart3} title="Facturación Período" value={formatCurrency(kpis.todas.facturacionPeriodo)} color="emerald" />
          <KpiCard icon={Clock} title="Pendiente Período" value={formatCurrency(kpis.todas.montoPendiente)} color="orange" />
          <KpiCard icon={Receipt} title="Facturación Global" value={formatCurrency(kpis.todas.globalFacturado)} color="purple" />
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Fila 1: Header */}
      <div className="flex-shrink-0">
        <PageHeader
          title={vendedor ? `Liquidaciones: ${capitalizeFirst(vendedor.nombre)} ${capitalizeFirst(vendedor.apellido)}` : 'Cargando...'}
          description="Gestión de comisiones y auditoría de ventas."
          backTo="/admin/vendedores"
          icon={TrendingUp}
          loading={loading && !vendedor}
        />
      </div>

      <div className="animate-in fade-in flex h-full flex-col space-y-6 overflow-hidden duration-500">
        {loading && !vendedor ? (
          <div className="flex-1 flex items-center justify-center">
            <InnerLoading message="Cargando información..." />
          </div>
        ) : (
          <>
            {/* Fila 2: Navegación y Filtros */}
            <div className="flex flex-shrink-0 flex-col items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 md:min-h-[60px] md:flex-row md:items-center !mt-10">
              <nav className="custom-scrollbar flex w-full space-x-8 overflow-x-auto pb-1 md:w-auto md:pb-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="flex w-full justify-end pb-3 md:w-auto">
                <DateRangeFilter
                  value={dateFilter}
                  onSearch={handleSearch}
                  loading={filtering}
                />
              </div>
            </div>

            {/* Fila 3: KPIs */}
            {renderContextualCards()}

            {/* Fila 4: Tablas */}
            <div className="flex min-h-[300px] flex-grow flex-col overflow-hidden">
              {activeTab === 'pendientes' && (
                <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                  <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas por Liquidar</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione las facturas para procesar el pago.</p>
                    </div>

                    <AppButton
                      variant="green"
                      onClick={() => setShowConfirmLiquidar(true)}
                      disabled={selectedVentas.length === 0}
                      loading={loadingAction}
                      icon={DollarSign}
                    >
                      Liquidar ({selectedVentas.length})
                    </AppButton>
                  </div>

                  <div className="flex-grow overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm relative">
                      <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-3 w-10">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                              checked={selectedVentas.length === pendingSales.length && pendingSales.length > 0}
                              onChange={handleSelectAll}
                              disabled={pendingSales.length === 0}
                            />
                          </th>
                          <th className="px-6 py-3">Descripción</th>
                          <th className="px-6 py-3 text-right">Monto</th>
                          <th className="px-6 py-3 text-right">Comisión (2%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingSales.length > 0 ? (
                          pendingSales.map((v) => (
                            <tr key={v.id} className="transition-colors hover:bg-blue-50/20 dark:hover:bg-blue-900/10">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                                  checked={selectedVentas.includes(v.id)}
                                  onChange={() => handleToggleSeleccion(v.id)}
                                />
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{v.descripcion}</td>
                              <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                                {formatCurrency(Number(v.subtotal))}
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(Number(v.subtotal) * 0.02)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                              No hay ventas pendientes para este período.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'liquidadas' && (
                <VentasTable 
                  data={liquidatedSales} 
                  emptyMessage="No se encontraron ventas liquidadas para el período seleccionado." 
                />
              )}

              {activeTab === 'todas' && (
                <VentasTable 
                  data={allSales} 
                  emptyMessage="No hay registros de ventas para el período seleccionado." 
                />
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showConfirmLiquidar}
        onClose={() => setShowConfirmLiquidar(false)}
        title="Confirmar Liquidación"
        onConfirm={handleLiquidarSeleccionadas}
        loading={loadingAction}
        confirmLabel="Confirmar y Generar Recibo"
        variant="green"
        size="sm"
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>¿Desea liquidar las <strong className="text-gray-900 dark:text-white">{selectedVentas.length}</strong> ventas seleccionadas?</p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Comisión (2%):</span>
              <strong className="text-green-600 dark:text-green-400 text-xl">
                {formatCurrency(selectedVentas.reduce((acc, vId) => {
                  const v = ventas.find(vent => vent.id === vId);
                  return acc + (v ? Number(v.subtotal) : 0);
                }, 0) * 0.02)}
              </strong>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function KpiCard({ icon: Icon, title, value, color }) {
  const styles = {
    purple: { container: 'border-purple-100 dark:border-purple-900/20', icon: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
    blue: { container: 'border-blue-100 dark:border-blue-900/20', icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
    amber: { container: 'border-amber-100 dark:border-amber-900/20', icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
    orange: { container: 'border-orange-100 dark:border-orange-900/20', icon: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' },
    indigo: { container: 'border-indigo-100 dark:border-indigo-900/20', icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' },
    emerald: { container: 'border-emerald-100 dark:border-emerald-900/20', icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
    green: { container: 'border-green-100 dark:border-green-900/20', icon: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className={`flex h-full flex-col justify-center rounded-xl border bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-gray-800 ${currentStyle.container}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-medium text-gray-500" title={title}>{title}</p>
          <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white md:text-xl" title={String(value)}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default VendedorLiquidaciones;
