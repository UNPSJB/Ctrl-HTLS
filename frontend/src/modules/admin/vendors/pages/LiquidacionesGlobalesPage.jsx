import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, DollarSign, Search, FileText, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { Loading } from '@ui/Loading';
import DateDisplay from '@ui/DateDisplay';

const LiquidacionesGlobalesPage = () => {
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fechas para filtros y nueva liquidación
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    // Cargar liquidaciones del mes actual por defecto
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setFechaInicio(firstDay.toISOString().split('T')[0]);
    setFechaFin(today.toISOString().split('T')[0]);
    
    //fetchLiquidaciones(firstDay.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    // Lo llamamos en el useEffect abajo dependiente de nada inicial o disparado manual
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchLiquidaciones();
    }
  }, [fechaInicio, fechaFin]);

  const fetchLiquidaciones = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/liquidaciones`, {
        params: { fechaInicio, fechaFin }
      });
      setLiquidaciones(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar historial de liquidaciones');
    } finally {
      setLoading(false);
    }
  };

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
      const response = await axiosInstance.post('/liquidaciones/liquidar', {
        fechaInicio,
        fechaFin
      });

      if (response.data.liquidaciones && response.data.liquidaciones.length > 0) {
        toast.success(`Se generaron ${response.data.liquidaciones.length} liquidaciones.`);
        fetchLiquidaciones(); // Recargar lista
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidaciones Globales</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Historial y generación masiva de pagos</p>
        </div>
        
        <button
          onClick={handleLiquidarMasivo}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 shadow-sm"
        >
          <DollarSign className="h-4 w-4" />
          Liquidar Periodo
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={fetchLiquidaciones}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
          >
            <Search className="h-4 w-4" />
            Filtrar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          ) : liquidaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="mb-2 h-8 w-8 opacity-50" />
              <p>No hay liquidaciones en el rango seleccionado.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Número</th>
                  <th className="px-6 py-3">Fecha Emisión</th>
                  <th className="px-6 py-3">Vendedor</th>
                  <th className="px-6 py-3 text-right">Total Comisión</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((liq) => (
                  <tr key={liq.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{liq.numero}</td>
                    <td className="px-6 py-4"><DateDisplay date={liq.fecha_emision} /></td>
                    <td className="px-6 py-4">
                      {liq.empleado ? `${liq.empleado.nombre} ${liq.empleado.apellido}` : 'Vendedor Eliminado'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                      ${Number(liq.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
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

export default LiquidacionesGlobalesPage;
