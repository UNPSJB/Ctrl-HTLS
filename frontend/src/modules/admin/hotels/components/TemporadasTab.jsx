import { useState } from 'react';
import {
  Calendar,
  Tag,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';

/**
 * Gestión de Temporadas (Alta/Baja) y Descuentos por volumen.
 * Unificado al sistema de colores Azul y corregido para Modo Oscuro.
 */
export default function TemporadasTab({ hotelId, initialTemporadas = [], initialDescuentos = [], onUpdate }) {
  const [temporadas, setTemporadas] = useState(initialTemporadas);
  const [descuentos, setDescuentos] = useState(initialDescuentos);
  const [loading, setLoading] = useState(false);
  const [showTemporadaForm, setShowTemporadaForm] = useState(false);
  const [showDescuentoForm, setShowDescuentoForm] = useState(false);

  const temporadaForm = useForm();
  const descuentoForm = useForm();

  const handleAddTemporada = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/hotel/${hotelId}/temporada`, data);
      toast.success('Temporada agregada correctamente');
      if (onUpdate) onUpdate();
      setShowTemporadaForm(false);
      temporadaForm.reset();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar temporada');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDescuento = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/hotel/${hotelId}/descuento`, data);
      toast.success('Descuento agregado correctamente');
      if (onUpdate) onUpdate();
      setShowDescuentoForm(false);
      descuentoForm.reset();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al agregar descuento');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemporada = async (id) => {
    if (!window.confirm('¿Confirma eliminar esta temporada?')) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/hotel/${hotelId}/temporada/${id}`);
      toast.success('Temporada eliminada');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in space-y-10 duration-500">
      {/* Sección Temporadas */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-blue-500" />
              Temporadas del Hotel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestione periodos de alta y baja demanda con ajustes porcentuales automáticos.
            </p>
          </div>
          <button
            onClick={() => setShowTemporadaForm(!showTemporadaForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            {showTemporadaForm ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
            {showTemporadaForm ? 'Cancelar' : 'Nueva Temporada'}
          </button>
        </div>

        {showTemporadaForm && (
          <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/20 dark:bg-blue-900/10">
            <form onSubmit={temporadaForm.handleSubmit(handleAddTemporada)} className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tipo</label>
                <select
                  {...temporadaForm.register('tipo', { required: true })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="alta">Temporada Alta (+)</option>
                  <option value="baja">Temporada Baja (-)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inicio</label>
                <input
                  type="date"
                  {...temporadaForm.register('fechaInicio', { required: true })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fin</label>
                <input
                  type="date"
                  {...temporadaForm.register('fechaFin', { required: true })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ajuste (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 15.00"
                    {...temporadaForm.register('porcentaje', { required: true })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Tipo</th>
                <th className="px-6 py-4 font-bold">Rango de Fechas</th>
                <th className="px-6 py-4 font-bold text-center">Ajuste</th>
                <th className="px-6 py-4 text-right font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {temporadas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8 opacity-20" />
                      <p>No hay temporadas configuradas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                temporadas.map((t) => (
                  <tr key={t.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                        {t.tipo === 'alta' ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className={t.tipo === 'alta' ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}>
                          {t.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300">
                        {new Date(t.fechaInicio).toLocaleDateString()} - {new Date(t.fechaFin).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {t.porcentaje}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTemporada(t.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección Descuentos */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Tag className="h-5 w-5 text-blue-500" />
              Descuentos por Cantidad
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure beneficios para clientes que reservan múltiples habitaciones simultáneamente.
            </p>
          </div>
          <button
            onClick={() => setShowDescuentoForm(!showDescuentoForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            {showDescuentoForm ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
            {showDescuentoForm ? 'Cancelar' : 'Nuevo Descuento'}
          </button>
        </div>

        {showDescuentoForm && (
          <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/20 dark:bg-blue-900/10">
            <form onSubmit={descuentoForm.handleSubmit(handleAddDescuento)} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cantidad de Habitaciones</label>
                <input
                  type="number"
                  placeholder="Ej: 3"
                  {...descuentoForm.register('cantidad_de_habitaciones', { required: true })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Porcentaje de Descuento (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 5.00"
                    {...descuentoForm.register('porcentaje', { required: true })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
           <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-700 sm:grid-cols-2 lg:grid-cols-3 sm:divide-y-0 sm:divide-x">
             {descuentos.length === 0 ? (
               <div className="col-span-full py-12 text-center text-gray-400 italic">
                 No hay descuentos configurados
               </div>
             ) : (
               descuentos.map((d) => (
                 <div key={d.id} className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-xs font-bold uppercase text-gray-500">Mínimo Habitaciones</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{d.cantidad_de_habitaciones}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-xs font-bold uppercase text-gray-500">Descuento</p>
                          <p className="text-2xl font-black text-gray-900 dark:text-white">{d.porcentaje}%</p>
                       </div>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
           <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
           <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
             Los descuentos por volumen se aplican automáticamente en el motor de reservas cuando el cliente selecciona la cantidad de habitaciones indicada o superior.
           </p>
        </div>
      </section>
    </div>
  );
}
