import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Mail,
  Phone,
  Hash,
  MapPin,
  DollarSign,
  CheckCircle2,
  Receipt,
  History,
  CalendarDays,
  Clock,
  BarChart3,
  Activity,
  Wallet,
} from 'lucide-react';
import { parseDate, startOfDay } from '@/utils/dateUtils';
import { getDateRangeByPreset } from '@/utils/dateRangeUtils';
import { getVentasVendedor } from '@/api/ventas/ventasService';
import { getLiquidacionesVendedor } from '@/api/liquidaciones/liquidacionesService';
import VentasTable from '@/modules/vendor/components/VentasTable';
import LiquidacionesTable from '@/modules/vendor/components/LiquidacionesTable';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

// Obtiene el lunes de la semana actual a las 00:00:00
const getLunesDeSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0=dom, 1=lun...
  const diff = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

// Página de Perfil para Vendedores - Solo Visualización
function PerfilPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [vendedorData, setVendedorData] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [activeTab, setActiveTab] = useState('semana');
  const [filtering, setFiltering] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    tipo: 'all',
    inicio: '',
    fin: '',
  });
  const searchAbortController = useRef(null);

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
      const userId = user?.id || user?.id_usuario;

      // Peticiones en paralelo con signal
      const [ventasData, liquidacionesData] = await Promise.all([
        getVentasVendedor(userId, { fechaInicio, fechaFin }, { signal }),
        getLiquidacionesVendedor(userId, { fechaInicio, fechaFin }, { signal })
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
  const { ventasSemana, kpis } =
    useMemo(() => {
      const lunes = getLunesDeSemana();

      // 1. Semana actual (Cálculo fijo basado en la carga inicial completa)
      const ventasSemana = (vendedorData?.ventas || []).filter((v) => {
        if (!v.fechaVenta) return false;
        return new Date(v.fechaVenta) >= lunes;
      });

      const ventasSemanaPendientes = ventasSemana.filter(
        (v) => !v.liquidacionId
      );
      const facturacionSemanal = ventasSemana.reduce(
        (acc, v) => acc + Number(v.subtotal),
        0
      );
      const pendienteSemanaMonto = ventasSemanaPendientes.reduce(
        (acc, v) => acc + Number(v.subtotal),
        0
      );
      const comisionSemanal = facturacionSemanal * 0.02;

      // 2. Historial Filtrado (Usa el estado 'ventas' directamente que viene del backend)
      const ventasHistorialFiltradas = [...ventas].sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));
      const liquidacionesFiltradasArr = [...liquidaciones].sort((a, b) => {
        const dateA = new Date(a.fechaEmision || a.fecha || a.fechaCreacion);
        const dateB = new Date(b.fechaEmision || b.fecha || b.fechaCreacion);
        return dateB - dateA;
      });

      const ventasPendientesGlobal = ventasHistorialFiltradas.filter(
        (v) => !v.liquidacionId
      );
      const totalFacturadoGlobal = ventasHistorialFiltradas.reduce(
        (acc, v) => acc + Number(v.subtotal),
        0
      );
      const comisionPendienteGlobal =
        ventasPendientesGlobal.reduce((acc, v) => acc + Number(v.subtotal), 0) *
        0.02;
      const totalPercibido = liquidacionesFiltradasArr.reduce(
        (acc, l) => acc + Number(l.total),
        0
      );

      return {
        ventasSemana,
        kpis: {
          semana: {
            ventasCount: ventasSemana.length,
            facturacion: facturacionSemanal,
            pendienteMonto: pendienteSemanaMonto,
            comision: comisionSemanal,
          },
          historial: {
            ventasCount: ventasHistorialFiltradas.length,
            facturacion: totalFacturadoGlobal,
            pendientesCount: ventasPendientesGlobal.length,
            comisionPendiente: comisionPendienteGlobal,
          },
          liquidaciones: {
            emitidasCount: liquidacionesFiltradasArr.length,
            totalPercibido,
            ventasLiquidadasCount:
              ventasHistorialFiltradas.length - ventasPendientesGlobal.length,
            comisionPendiente: comisionPendienteGlobal,
          },
        },
      };
    }, [ventas, liquidaciones, vendedorData]);

  const TABS = [
    { id: 'semana', label: 'Semana Actual', icon: CalendarDays },
    { id: 'historial', label: 'Historial de Ventas', icon: History },
    { id: 'liquidaciones', label: 'Mis Liquidaciones', icon: Receipt },
  ];

  if (!user || user.rol !== 'vendedor') {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        No tienes permisos para visualizar esta página.
      </div>
    );
  }

  // Renderizador de KPIs contextuales según el Tab
  const renderContextualCards = () => {
    if (activeTab === 'semana') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard
            icon={CalendarDays}
            title="Ventas Semana"
            value={kpis.semana.ventasCount}
            color="purple"
          />
          <KpiCard
            icon={BarChart3}
            title="Facturación Semanal"
            value={formatCurrency(kpis.semana.facturacion)}
            color="blue"
          />
          <KpiCard
            icon={Clock}
            title="Pendiente Semana"
            value={formatCurrency(kpis.semana.pendienteMonto)}
            color="amber"
          />
          <KpiCard
            icon={DollarSign}
            title="Comisión Semanal"
            value={formatCurrency(kpis.semana.comision)}
            color="orange"
          />
        </div>
      );
    }

    if (activeTab === 'historial') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard
            icon={Activity}
            title="Ventas en Período"
            value={kpis.historial.ventasCount}
            color="indigo"
          />
          <KpiCard
            icon={Receipt}
            title="Facturado en Período"
            value={formatCurrency(kpis.historial.facturacion)}
            color="emerald"
          />
          <KpiCard
            icon={Clock}
            title="Pendientes"
            value={kpis.historial.pendientesCount}
            color="amber"
          />
          <KpiCard
            icon={DollarSign}
            title="Comisión Pendiente"
            value={formatCurrency(kpis.historial.comisionPendiente)}
            color="orange"
          />
        </div>
      );
    }

    if (activeTab === 'liquidaciones') {
      return (
        <div className="animate-in fade-in slide-in-from-top-2 grid flex-shrink-0 grid-cols-2 gap-3 duration-300 lg:grid-cols-4">
          <KpiCard
            icon={Receipt}
            title="Liquidaciones Emitidas"
            value={kpis.liquidaciones.emitidasCount}
            color="cyan"
          />
          <KpiCard
            icon={Wallet}
            title="Total Percibido"
            value={formatCurrency(kpis.liquidaciones.totalPercibido)}
            color="green"
          />
          <KpiCard
            icon={CheckCircle2}
            title="Ventas Liquidadas"
            value={kpis.liquidaciones.ventasLiquidadasCount}
            color="blue"
          />
          <KpiCard
            icon={DollarSign}
            title="Próxima Comisión"
            value={formatCurrency(kpis.liquidaciones.comisionPendiente)}
            color="orange"
          />
        </div>
      );
    }
  };

  return (
    <div className="animate-in fade-in flex h-full flex-col space-y-6 overflow-hidden duration-500">
      {loading ? (
        <div className="flex-2 flex items-center justify-center">
          <InnerLoading message="Obteniendo información del perfil..." />
        </div>
      ) : (
        <>
          {/* Fila 1: Datos de Identidad y Operativos */}
          {vendedorData && (
            <div className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {capitalizeWords(
                    `${vendedorData.nombre} ${vendedorData.apellido}`
                  )}
                </h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="uppercase tracking-wide">
                      {vendedorData.tipoDocumento || 'DOC'}:{' '}
                      {vendedorData.numeroDocumento || 'No registrado'}
                    </span>
                  </div>
                  {vendedorData.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{vendedorData.telefono}</span>
                    </div>
                  )}
                  {vendedorData.email && (
                    <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{vendedorData.email}</span>
                    </div>
                  )}
                  {vendedorData.ubicacion?.ciudadNombre && (
                    <div className="flex items-end gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>
                        {capitalizeWords(
                          `${vendedorData.ubicacion.paisNombre}, ${vendedorData.ubicacion.provinciaNombre}, ${vendedorData.ubicacion.ciudadNombre}`
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Permisos Operativos (Hoteles Asociados) */}
              <div className="mt-4 flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" /> Hoteles
                  Asignados (Límite Operativo)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendedorData.hotelesPermitidos?.length > 0 ? (
                    vendedorData.hotelesPermitidos.map((hotel) => (
                      <span
                        key={hotel.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-800/20 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {capitalizeWords(hotel.nombre)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm italic text-gray-500">
                      No tienes hoteles asignados para operar.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fila 2: Navegación de Vistas y Filtros */}
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

            {/* El filtro es permanente, independientemente de si los datos son mock o no */}
            {activeTab !== 'semana' && (
              <div className="flex w-full justify-end pb-3 md:w-auto">
                <DateRangeFilter
                  value={dateFilter}
                  onSearch={handleSearch}
                  loading={filtering}
                />
              </div>
            )}
          </div>

          {/* Fila 3: KPIs Contextuales */}
          {renderContextualCards()}

          {/* Fila 4: Área de Tablas */}
          <div className="flex min-h-[300px] flex-grow flex-col">
            {activeTab === 'semana' && (
              <VentasTable
                data={ventasSemana}
                emptyMessage="No hay ventas registradas en la semana actual (lunes a hoy)."
              />
            )}

            {activeTab === 'historial' && (
              <VentasTable
                data={ventas}
                emptyMessage="No se encontraron ventas para el período seleccionado."
              />
            )}

            {activeTab === 'liquidaciones' && (
              <LiquidacionesTable
                data={liquidaciones}
                emptyMessage="No se encontraron liquidaciones para el período seleccionado."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Componente Auxiliar para las Tarjetas
function KpiCard({ icon: Icon, title, value, color }) {
  const styles = {
    purple: {
      container: 'border-purple-100 dark:border-purple-900/20',
      icon: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
    },
    blue: {
      container: 'border-blue-100 dark:border-blue-900/20',
      icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    },
    amber: {
      container: 'border-amber-100 dark:border-amber-900/20',
      icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    },
    orange: {
      container: 'border-orange-100 dark:border-orange-900/20',
      icon: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',
    },
    indigo: {
      container: 'border-indigo-100 dark:border-indigo-900/20',
      icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
    },
    emerald: {
      container: 'border-emerald-100 dark:border-emerald-900/20',
      icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    },
    cyan: {
      container: 'border-cyan-100 dark:border-cyan-900/20',
      icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20',
    },
    green: {
      container: 'border-green-100 dark:border-green-900/20',
      icon: 'bg-green-50 text-green-600 dark:bg-green-900/20',
    },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div
      className={`flex h-full flex-col justify-center rounded-xl border bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-gray-800 ${currentStyle.container}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-1 text-xs font-medium text-gray-500"
            title={title}
          >
            {title}
          </p>
          <h3
            className="truncate text-lg font-bold text-gray-900 dark:text-white md:text-xl"
            title={String(value)}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;
