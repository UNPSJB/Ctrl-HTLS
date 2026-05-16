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
  BarChart3,
  Download,
} from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader, Modal } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';
import { parseDate, toISODate, formatFecha } from '@/utils/dateUtils';
import { getDateRangeByPreset } from '@/utils/dateRangeUtils';
import { getVentasVendedor } from '@/api/ventas/ventasService';
import { getLiquidacionesVendedor } from '@/api/liquidaciones/liquidacionesService';
import { formatCurrency } from '@/utils/pricingUtils';
import { downloadBase64PDF } from '@/utils/pdfUtils';
import { exportToExcel } from '@/utils/exportUtils';
import AppButton from '@/components/ui/AppButton';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import VentasTable from '@/modules/vendor/components/VentasTable';
import KpiCard from '@/components/ui/KpiCard';

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
        getLiquidacionesVendedor(id, { fechaInicio, fechaFin }, { signal }),
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
    // 1. Listas filtradas del backend (período actual)
    const filteredAllSales = [...ventas].sort(
      (a, b) => parseDate(b.fechaVenta) - parseDate(a.fechaVenta)
    );
    const filteredPendingSales = filteredAllSales.filter(
      (v) => !v.liquidacionId
    );
    const filteredLiquidatedSales = filteredAllSales.filter(
      (v) => !!v.liquidacionId
    );

    // 2. Cálculos globales (independientes del filtro, sobre la carga inicial)
    const baseVentas = vendedor?.ventas || [];
    const totalGlobalPendiente =
      baseVentas
        .filter((v) => !v.liquidacionId)
        .reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;

    // 3. KPIs por tab (basados en el período filtrado)
    const facturacionFiltrada = filteredAllSales.reduce(
      (acc, v) => acc + Number(v.subtotal),
      0
    );
    const comisionPendienteFiltrada =
      filteredPendingSales.reduce((acc, v) => acc + Number(v.subtotal), 0) *
      0.02;
    const comisionLiquidadaFiltrada =
      filteredLiquidatedSales.reduce((acc, v) => acc + Number(v.subtotal), 0) *
      0.02;

    return {
      pendingSales: filteredPendingSales,
      liquidatedSales: filteredLiquidatedSales,
      allSales: filteredAllSales,
      kpis: {
        pendientes: {
          ventasCount: filteredPendingSales.length,
          comisionAPagar: comisionPendienteFiltrada,
          facturacionPeriodo: facturacionFiltrada,
          deudaHistorica: totalGlobalPendiente,
        },
        liquidadas: {
          ventasCount: filteredLiquidatedSales.length,
          comisionLiquidada: comisionLiquidadaFiltrada,
          comisionPendiente: comisionPendienteFiltrada,
          porPercibir: totalGlobalPendiente,
        },
        todas: {
          ventasCount: filteredAllSales.length,
          facturacionPeriodo: facturacionFiltrada,
          comisionLiquidada: comisionLiquidadaFiltrada,
          comisionPendiente: comisionPendienteFiltrada,
        },
      },
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
      const response = await axiosInstance.post(
        `/liquidaciones/liquidar-detalles/${id}`,
        {
          detalleIds: selectedVentas,
        }
      );

      const { pdfBase64 } = response.data;
      if (pdfBase64) {
        const fechaStr = toISODate(new Date());
        const fileName = `Recibo_Liquidacion_Vendedor_${id}_${fechaStr}.pdf`;
        downloadBase64PDF(pdfBase64, fileName);
      }

      toast.success(
        `Liquidación generada correctamente (${selectedVentas.length} ventas)`
      );
      setShowConfirmLiquidar(false);
      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Error al procesar la liquidación'
      );
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
          <KpiCard
            icon={ShoppingBag}
            title="Ventas a Liquidar"
            value={kpis.pendientes.ventasCount}
            color="amber"
          />
          <KpiCard
            icon={DollarSign}
            title="Comisión a Pagar"
            value={formatCurrency(kpis.pendientes.comisionAPagar)}
            color="orange"
          />
          <KpiCard
            icon={Receipt}
            title="Facturación del Período"
            value={formatCurrency(kpis.pendientes.facturacionPeriodo)}
            color="blue"
          />
          <KpiCard
            icon={Clock}
            title="Deuda Histórica"
            value={formatCurrency(kpis.pendientes.deudaHistorica)}
            color="indigo"
          />
        </div>
      );
    }

    if (activeTab === 'liquidadas') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard
            icon={CheckCircle2}
            title="Ventas Liquidadas"
            value={kpis.liquidadas.ventasCount}
            color="emerald"
          />
          <KpiCard
            icon={DollarSign}
            title="Comisión Liquidada"
            value={formatCurrency(kpis.liquidadas.comisionLiquidada)}
            color="green"
          />
          <KpiCard
            icon={Clock}
            title="Comisión Pendiente"
            value={formatCurrency(kpis.liquidadas.comisionPendiente)}
            color="amber"
          />
          <KpiCard
            icon={Receipt}
            title="Por Percibir"
            value={formatCurrency(kpis.liquidadas.porPercibir)}
            color="purple"
          />
        </div>
      );
    }

    if (activeTab === 'todas') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard
            icon={History}
            title="Ventas en Período"
            value={kpis.todas.ventasCount}
            color="blue"
          />
          <KpiCard
            icon={BarChart3}
            title="Facturación del Período"
            value={formatCurrency(kpis.todas.facturacionPeriodo)}
            color="emerald"
          />
          <KpiCard
            icon={CheckCircle2}
            title="Comisión Liquidada"
            value={formatCurrency(kpis.todas.comisionLiquidada)}
            color="green"
          />
          <KpiCard
            icon={DollarSign}
            title="Comisión Pendiente"
            value={formatCurrency(kpis.todas.comisionPendiente)}
            color="orange"
          />
        </div>
      );
    }
  };

  const currentRange = getDateRangeByPreset(dateFilter);

  return (
    <div className="flex h-full flex-col space-y-6 overflow-hidden">
      {/* Fila 1: Header */}
      <div className="flex-shrink-0">
        <PageHeader
          title={
            vendedor
              ? `Liquidaciones: ${capitalizeFirst(vendedor.nombre)} ${capitalizeFirst(vendedor.apellido)}`
              : 'Cargando...'
          }
          description="Gestión de comisiones y auditoría de ventas."
          backTo="/admin/vendedores"
          icon={TrendingUp}
          loading={loading && !vendedor}
        />
      </div>

      <div className="animate-in fade-in flex h-full flex-col space-y-6 overflow-hidden duration-500">
        {loading && !vendedor ? (
          <div className="flex flex-1 items-center justify-center">
            <InnerLoading message="Cargando información..." />
          </div>
        ) : (
          <>
            {/* Fila 2: Navegación y Filtros */}
            <div className="!mt-10 flex flex-shrink-0 flex-col items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 md:min-h-[60px] md:flex-row md:items-center">
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
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-shrink-0 flex-col gap-3 border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/20 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Ventas por Liquidar
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Seleccione las facturas para procesar el pago.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const exportColumns = [
                            { key: 'descripcion', label: 'Descripción' },
                            { key: '_monto', label: 'Monto' },
                            { key: '_comision', label: 'Comisión (2%)' },
                            { key: '_fecha', label: 'Fecha' },
                          ];
                          const exportData = pendingSales.map((v) => ({
                            descripcion: v.descripcion,
                            _monto: formatCurrency(Number(v.subtotal)),
                            _comision: formatCurrency(
                              Number(v.subtotal) * 0.02
                            ),
                            _fecha: formatFecha(v.fechaVenta),
                          }));
                          exportToExcel(
                            exportData,
                            exportColumns,
                            'ventas_pendientes'
                          );
                        }}
                        disabled={pendingSales.length === 0}
                        title="Exportar a Excel"
                        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </button>

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
                  </div>

                  <div className="custom-scrollbar flex-grow overflow-auto">
                    <table className="relative w-full text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="w-10 px-6 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={
                                selectedVentas.length === pendingSales.length &&
                                pendingSales.length > 0
                              }
                              onChange={handleSelectAll}
                              disabled={pendingSales.length === 0}
                            />
                          </th>
                          <th className="px-6 py-3">Descripción</th>
                          <th className="px-6 py-3 text-right">Monto</th>
                          <th className="px-6 py-3 text-right">
                            Comisión (2%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingSales.length > 0 ? (
                          pendingSales.map((v) => (
                            <tr
                              key={v.id}
                              className="transition-colors hover:bg-blue-50/20 dark:hover:bg-blue-900/10"
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedVentas.includes(v.id)}
                                  onChange={() => handleToggleSeleccion(v.id)}
                                />
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {v.descripcion}
                              </td>
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
                            <td
                              colSpan="4"
                              className="px-6 py-12 text-center font-medium italic text-gray-400"
                            >
                              <AlertCircle className="mx-auto mb-2 h-10 w-10 opacity-20" />
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
                  fechaInicio={currentRange.fechaInicio}
                  fechaFin={currentRange.fechaFin}
                  emptyMessage="No se encontraron ventas liquidadas para el período seleccionado."
                />
              )}

              {activeTab === 'todas' && (
                <VentasTable
                  data={allSales}
                  fechaInicio={currentRange.fechaInicio}
                  fechaFin={currentRange.fechaFin}
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
          <p>
            ¿Desea liquidar las{' '}
            <strong className="text-gray-900 dark:text-white">
              {selectedVentas.length}
            </strong>{' '}
            ventas seleccionadas?
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Comisión (2%):</span>
              <strong className="text-xl text-green-600 dark:text-green-400">
                {formatCurrency(
                  selectedVentas.reduce((acc, vId) => {
                    const v = ventas.find((vent) => vent.id === vId);
                    return acc + (v ? Number(v.subtotal) : 0);
                  }, 0) * 0.02
                )}
              </strong>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendedorLiquidaciones;
