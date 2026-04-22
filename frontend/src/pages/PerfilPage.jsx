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
  Receipt, History, CalendarDays, Clock
} from 'lucide-react';

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

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—';
  return new Date(fechaStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
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

    const ventasPendientes = ventas.filter(v => !v.liquidacionId);
    const totalFacturado = ventas.reduce((acc, v) => acc + Number(v.subtotal), 0);
    const comisionPorCobrar = ventasPendientes.reduce((acc, v) => acc + Number(v.subtotal), 0) * 0.02;
    const totalPercibido = liquidaciones.reduce((acc, l) => acc + Number(l.total), 0);
    const montoPendienteSemana = ventasSemana
      .filter(v => !v.liquidacionId)
      .reduce((acc, v) => acc + Number(v.subtotal), 0);

    return {
      ventasSemana,
      ventasHistorial: [...ventas].sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta)),
      kpis: {
        totalFacturado,
        ventasPendientesCount: ventasPendientes.length,
        comisionPorCobrar,
        totalPercibido,
        ventasSemanaCount: ventasSemana.length,
        montoPendienteSemana,
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

  return (
    <div className="animate-in fade-in duration-500 space-y-6 h-full flex flex-col overflow-hidden">
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <InnerLoading message="Obteniendo información financiera..." />
        </div>
      ) : (
        <>
          {/* Encabezado de Datos Personales */}
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

          {/* KPI Cards */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Semana Actual */}
            <div className="col-span-2 lg:col-span-1 rounded-xl border border-purple-100 bg-white p-4 shadow-sm dark:border-purple-900/20 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Ventas Esta Semana</p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{kpis.ventasSemanaCount}</h3>
                </div>
              </div>
            </div>

            {/* Total Facturado */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Facturado</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.totalFacturado)}</h3>
                </div>
              </div>
            </div>

            {/* Sin Liquidar */}
            <div className="rounded-xl border border-amber-50 bg-white p-4 shadow-sm dark:border-amber-900/10 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Sin Liquidar</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{kpis.ventasPendientesCount} ventas</h3>
                </div>
              </div>
            </div>

            {/* Comisión por Cobrar */}
            <div className="rounded-xl border border-orange-50 bg-white p-4 shadow-sm dark:border-orange-900/10 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Comisión por Cobrar</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.comisionPorCobrar)}</h3>
                </div>
              </div>
            </div>

          </div>

          {/* Área de Tablas */}
          <div className="flex-grow flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[280px]">
            {/* Tabs */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 bg-gray-50/50 dark:bg-gray-900/20">
              <nav className="-mb-px flex space-x-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
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

            <div className="flex-grow overflow-auto custom-scrollbar">
              {/* Tab: Semana Actual */}
              {activeTab === 'semana' && (
                <table className="w-full text-left text-sm relative">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-right">Comisión (2%)</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {ventasSemana.length > 0 ? (
                      ventasSemana.map((v) => (
                        <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">{v.descripcion}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatFecha(v.fechaVenta)}</td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(v.subtotal)}</td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(v.subtotal) * 0.02)}</td>
                          <td className="px-6 py-4 text-center">
                            {v.liquidacionId ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Liquidada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-3 w-3" /> Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                          No hay ventas registradas en la semana actual (lunes a hoy).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Tab: Historial de Ventas */}
              {activeTab === 'historial' && (
                <table className="w-full text-left text-sm relative">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-right">Comisión (2%)</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {ventasHistorial.length > 0 ? (
                      ventasHistorial.map((v) => (
                        <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">{v.descripcion}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatFecha(v.fechaVenta)}</td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(v.subtotal)}</td>
                          <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(Number(v.subtotal) * 0.02)}</td>
                          <td className="px-6 py-4 text-center">
                            {v.liquidacionId ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Liquidada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-3 w-3" /> Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No se encontraron ventas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Tab: Liquidaciones */}
              {activeTab === 'liquidaciones' && (
                <table className="w-full text-left text-sm relative">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Referencia</th>
                      <th className="px-6 py-4">Fecha Emisión</th>
                      <th className="px-6 py-4">Fecha Pago</th>
                      <th className="px-6 py-4 text-right">Total Comisión</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {liquidaciones.length > 0 ? (
                      [...liquidaciones]
                        .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision))
                        .map((l) => (
                          <tr key={l.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-gray-500">#{l.numero}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatFecha(l.fechaEmision)}</td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{formatFecha(l.fechaPago)}</td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(l.total)}</td>
                            <td className="px-6 py-4 text-center">
                              {l.fechaPago ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" /> Cobrada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  <Clock className="h-3 w-3" /> Por Cobrar
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No hay liquidaciones registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilPage;
