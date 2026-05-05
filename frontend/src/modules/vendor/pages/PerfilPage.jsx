import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords } from '@/utils/stringUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { toast } from 'react-hot-toast';
import {
  Building2, Mail, Phone, Hash, MapPin,
  DollarSign, CheckCircle2,
  Receipt, History, CalendarDays, Clock, 
  BarChart3, Activity, Wallet
} from 'lucide-react';
import { formatFecha } from '@/utils/dateUtils';
import VentasTable from '@/modules/vendor/components/VentasTable';
import LiquidacionesTable from '@/modules/vendor/components/LiquidacionesTable';

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

  // --- Cálculos derivados ---
  const { ventasSemana, ventasHistorial, kpis } = useMemo(() => {
    const lunes = getLunesDeSemana();

    const ventasSemana = ventas.filter(v => {
      if (!v.fechaVenta) return false;
      return new Date(v.fechaVenta) >= lunes;
    });

    const ventasPendientesGlobal = ventas.filter(v => !v.liquidacionId);

    // KPIs Semana Actual
    const ventasSemanaPendientes = ventasSemana.filter(v => !v.liquidacionId);
    const facturacionSemanal = ventasSemana.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const pendienteSemanaMonto = ventasSemanaPendientes.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const comisionSemanal = facturacionSemanal * 0.02; // 2% 

    // KPIs Historial
    const totalFacturadoGlobal = ventas.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const comisionPendienteGlobal = ventasPendientesGlobal.reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;

    // KPIs Liquidaciones
    const totalPercibido = liquidaciones.reduce((acc, l) => acc + Number(l.total), 0);
    const ventasLiquidadasCount = ventas.length - ventasPendientesGlobal.length;

    return {
      ventasSemana,
      ventasHistorial: [...ventas].sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta)),
      kpis: {
        semana: {
          ventasCount: ventasSemana.length,
          facturacion: facturacionSemanal,
          pendienteMonto: pendienteSemanaMonto,
          comision: comisionSemanal,
        },
        historial: {
          ventasCount: ventas.length,
          facturacion: totalFacturadoGlobal,
          pendientesCount: ventasPendientesGlobal.length,
          comisionPendiente: comisionPendienteGlobal,
        },
        liquidaciones: {
          emitidasCount: liquidaciones.length,
          totalPercibido,
          ventasLiquidadasCount,
          comisionPendiente: comisionPendienteGlobal, // Usamos la misma como recordatorio
        }
      }
    };
  }, [ventas, liquidaciones]);

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

  // --- Renderizador de Tarjetas Dinámico ---
  const renderCards = () => {
    switch (activeTab) {
      case 'semana':
        return (
          <>
            <KpiCard icon={CalendarDays} title="Ventas de la Semana" value={kpis.semana.ventasCount} color="purple" />
            <KpiCard icon={BarChart3} title="Facturación Semanal" value={formatCurrency(kpis.semana.facturacion)} color="blue" />
            <KpiCard icon={Clock} title="Pendiente Semana" value={formatCurrency(kpis.semana.pendienteMonto)} color="amber" />
            <KpiCard icon={DollarSign} title="Comisión Semanal" value={formatCurrency(kpis.semana.comision)} color="orange" />
          </>
        );
      case 'historial':
        return (
          <>
            <KpiCard icon={Activity} title="Total Histórico" value={kpis.historial.ventasCount} color="indigo" />
            <KpiCard icon={Receipt} title="Total Facturado" value={formatCurrency(kpis.historial.facturacion)} color="emerald" />
            <KpiCard icon={Clock} title="Total Pendientes" value={kpis.historial.pendientesCount} color="amber" />
            <KpiCard icon={DollarSign} title="Comisión Pendiente" value={formatCurrency(kpis.historial.comisionPendiente)} color="orange" />
          </>
        );
      case 'liquidaciones':
        return (
          <>
            <KpiCard icon={Receipt} title="Liquidaciones Emitidas" value={kpis.liquidaciones.emitidasCount} color="cyan" />
            <KpiCard icon={Wallet} title="Total Percibido" value={formatCurrency(kpis.liquidaciones.totalPercibido)} color="green" />
            <KpiCard icon={CheckCircle2} title="Ventas Liquidadas" value={kpis.liquidaciones.ventasLiquidadasCount} color="blue" />
            <KpiCard icon={DollarSign} title="Próxima Comisión" value={formatCurrency(kpis.liquidaciones.comisionPendiente)} color="orange" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 h-full flex flex-col overflow-hidden">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <InnerLoading message="Obteniendo información financiera..." />
        </div>
      ) : (
        <>
          {/* Fila 1: Encabezado de Datos Personales */}
          {vendedorData && (
            <div className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-700 flex-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {capitalizeWords(`${vendedorData.nombre} ${vendedorData.apellido}`)}
                </h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="uppercase tracking-wide">
                      {vendedorData.tipoDocumento || 'DOC'}: {vendedorData.numeroDocumento || 'No registrado'}
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
                        {capitalizeWords(`${vendedorData.ubicacion.paisNombre}, ${vendedorData.ubicacion.provinciaNombre}, ${vendedorData.ubicacion.ciudadNombre}`)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hoteles Asociados */}
              <div className="mt-4 flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" /> Hoteles Asociados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vendedorData.hotelesPermitidos?.length > 0 ? (
                    vendedorData.hotelesPermitidos.map(hotel => (
                      <span
                        key={hotel.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-800/20 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {capitalizeWords(hotel.nombre)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm italic text-gray-500">No tienes hoteles asignados.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fila 2: Navegación de Tabs (Fuera de la tabla) */}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
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
          </div>

          {/* Fila 3: KPI Cards Reactivas */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-300" key={activeTab}>
            {renderCards()}
          </div>

          {/* Fila 4: Área de Tablas */}
          <div className="flex-grow flex flex-col min-h-[280px]">
            {activeTab === 'semana' && (
              <VentasTable 
                data={ventasSemana} 
                emptyMessage="No hay ventas registradas en la semana actual (lunes a hoy)." 
              />
            )}

            {activeTab === 'historial' && (
              <VentasTable 
                data={ventasHistorial} 
                emptyMessage="No se encontraron ventas en el historial." 
              />
            )}

            {activeTab === 'liquidaciones' && (
              <LiquidacionesTable data={liquidaciones} />
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
      container: "border-purple-100 dark:border-purple-900/20",
      icon: "bg-purple-50 text-purple-600 dark:bg-purple-900/20"
    },
    blue: {
      container: "border-blue-100 dark:border-blue-900/20",
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
    },
    amber: {
      container: "border-amber-100 dark:border-amber-900/20",
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20"
    },
    orange: {
      container: "border-orange-100 dark:border-orange-900/20",
      icon: "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
    },
    indigo: {
      container: "border-indigo-100 dark:border-indigo-900/20",
      icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
    },
    emerald: {
      container: "border-emerald-100 dark:border-emerald-900/20",
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
    },
    cyan: {
      container: "border-cyan-100 dark:border-cyan-900/20",
      icon: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20"
    },
    green: {
      container: "border-green-100 dark:border-green-900/20",
      icon: "bg-green-50 text-green-600 dark:bg-green-900/20"
    }
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className={`col-span-2 lg:col-span-1 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800 transition-colors duration-300 ${currentStyle.container}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentStyle.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 line-clamp-1">{title}</p>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;