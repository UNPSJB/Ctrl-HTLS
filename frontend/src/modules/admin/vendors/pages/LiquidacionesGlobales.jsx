import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, DollarSign, Search, FileText, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader } from '@admin-ui';

// Página para consulta y generación masiva de liquidaciones
const LiquidacionesGlobales = () => {
  const navigate = useNavigate();
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasBuscado, setHasBuscado] = useState(false);

  // Fechas por defecto: primer día del mes actual → hoy
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [fechaInicio, setFechaInicio] = useState(firstDay.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(today.toISOString().split('T')[0]);

  // Solo se dispara manualmente al presionar "Buscar"
  const fetchLiquidaciones = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Seleccione un rango de fechas');
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get('/liquidaciones', {
        params: { fechaInicio, fechaFin },
      });
      setLiquidaciones(response.data);
      setHasBuscado(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar historial de liquidaciones');
    } finally {
      setLoading(false);
    }
  };

  // Genera liquidaciones masivas para todos los vendedores del periodo
  const handleLiquidarMasivo = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Seleccione un rango de fechas');
      return;
    }
    if (!window.confirm(`¿Seguro que desea generar liquidaciones para TODOS los vendedores entre ${fechaInicio} y ${fechaFin}?`)) {
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.post('/liquidaciones/liquidar', { fechaInicio, fechaFin });
      if (response.data.liquidaciones?.length > 0) {
        toast.success(`Se generaron ${response.data.liquidaciones.length} liquidaciones.`);
        fetchLiquidaciones(); // Refrescar resultados automáticamente tras liquidar
      } else {
        toast.success(response.data.message || 'Proceso completado');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al generar liquidaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">

      {/* Encabezado Global */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Liquidaciones Globales"
          description="Historial y generación masiva de pagos"
          backTo="/admin/vendedores"
          icon={DollarSign}
          extra={
            <button
              onClick={handleLiquidarMasivo}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 h-10 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              Liquidar Periodo
            </button>
          }
        />
      </div>

      {/* Panel de filtros y tabla */}
      <div className="relative flex-grow flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Overlay de carga */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
            <InnerLoading message="Consultando historial..." />
          </div>
        )}

        {/* Cabecera con filtros */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/20">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={fetchLiquidaciones}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </div>
        </div>

        {/* Contenido de la tabla */}
        <div className="flex-grow overflow-auto custom-scrollbar">
          {!hasBuscado ? (
            // Estado inicial: todavía no se realizó ninguna búsqueda
            <div className="flex flex-col h-full items-center justify-center py-16 text-gray-400">
              <Search className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Seleccione un rango de fechas y presione <strong>Buscar</strong></p>
            </div>
          ) : liquidaciones.length === 0 ? (
            // Se buscó pero no hay resultados
            <div className="flex flex-col h-full items-center justify-center py-16 text-gray-400">
              <FileText className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm italic">No hay liquidaciones en el rango seleccionado.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm relative">
              <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Fecha de Liquidación</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3 text-right">Total Comisión</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {liquidaciones.map((liq) => (
                  <tr key={liq.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                      #{liq.numero}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(liq.fecha_emision).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                      {liq.empleado ? `${liq.empleado.nombre} ${liq.empleado.apellido}` : 'Vendedor Eliminado'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-green-600 dark:text-green-400">
                      ${Number(liq.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Generada
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidacionesGlobales;
