import { useState, useEffect } from 'react';
import { Tag, Plus, Info, Calendar as CalendarIcon, Users, BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

export default function PaquetesTab({ hotelId }) {
  const [paquetes, setPaquetes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  // Observar fecha inicio para limitar fecha fin
  const fechaInicio = watch('fecha_inicio');

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    try {
      setLoadingInitial(true);
      const [resPaquetes, resHabitaciones] = await Promise.all([
        axiosInstance.get(`/hotel/${hotelId}/paquetes`),
        axiosInstance.get(`/hotel/${hotelId}/habitaciones`)
      ]);
      setPaquetes(resPaquetes.data || []);
      setHabitaciones(resHabitaciones.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos de paquetes y habitaciones');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleCreatePaquete = async (data) => {
    // Verificar que haya al menos una habitación seleccionada
    const habitacionesSeleccionadas = data.habitaciones || [];
    if (habitacionesSeleccionadas.length === 0) {
      toast.error('Debes seleccionar al menos una habitación para el paquete');
      return;
    }

    try {
      setLoadingAction(true);
      
      const payload = {
        nombre: data.nombre,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        coeficiente_descuento: parseFloat(data.coeficiente_descuento),
        habitaciones: habitacionesSeleccionadas.map(id => parseInt(id, 10))
      };

      await axiosInstance.post(`/hotel/${hotelId}/paquete-promocional`, payload);
      toast.success('Paquete creado exitosamente');
      setShowForm(false);
      reset();
      fetchData(); // Recargar la lista
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Error al crear el paquete promocional';
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loadingInitial) return <InnerLoading />;

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-blue-500" />
            Paquetes Promocionales
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cree ofertas combinando múltiples habitaciones por un precio especial.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
        >
          {showForm ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Paquete'}
        </button>
      </div>

      {showForm && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/20 dark:bg-blue-900/10">
          <form onSubmit={handleSubmit(handleCreatePaquete)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre del Paquete</label>
                <input
                  type="text"
                  placeholder="Ej: Finde Romántico"
                  {...register('nombre', { required: 'Requerido' })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Desde</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('fecha_inicio', { required: 'Requerido' })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.fecha_inicio && <p className="text-xs text-red-500">{errors.fecha_inicio.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hasta</label>
                <input
                  type="date"
                  min={fechaInicio || new Date().toISOString().split('T')[0]}
                  {...register('fecha_fin', { required: 'Requerido' })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.fecha_fin && <p className="text-xs text-red-500">{errors.fecha_fin.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 20.00"
                  {...register('coeficiente_descuento', { required: 'Requerido', min: 0.1, max: 100 })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.coeficiente_descuento && <p className="text-xs text-red-500">Valor inválido</p>}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Seleccione las habitaciones a incluir:
              </label>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">Inclusión</th>
                      <th className="px-4 py-3">Piso - Número</th>
                      <th className="px-4 py-3">Tipo de Habitación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {habitaciones.length === 0 ? (
                      <tr key="empty-rooms">
                        <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500 italic">
                          No hay habitaciones registradas en este hotel.
                        </td>
                      </tr>
                    ) : (
                      habitaciones.map((hab, idx) => (
                        <tr key={hab.id || `hab-${hab.piso}-${hab.numero}-${idx}`} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-900/10">
                          <td className="px-4 py-3 text-center align-middle">
                            <input
                              type="checkbox"
                              value={hab.id || `${hab.piso}-${hab.numero}`}
                              {...register('habitaciones')}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-gray-600 dark:bg-gray-700"
                            />
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                            Piso {hab.piso} - N° {hab.numero}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {hab?.tipoHabitacion?.nombre || 'Sin tipo'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loadingAction}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingAction ? 'Guardando...' : 'Crear Paquete'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Paquetes */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-bold">Nombre del Paquete</th>
              <th className="px-6 py-4 font-bold text-center">Desde</th>
              <th className="px-6 py-4 font-bold text-center">Hasta</th>
              <th className="px-6 py-4 font-bold text-center">Descuento</th>
              <th className="px-6 py-4 font-bold">Habitaciones</th>
              <th className="px-6 py-4 text-center font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paquetes.length === 0 ? (
              <tr key="empty-packages">
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Tag className="h-8 w-8 opacity-20" />
                    <p>No se han configurado paquetes promocionales.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paquetes.map((paquete, pIdx) => (
                <tr key={paquete.id || `pkg-${pIdx}`} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {paquete.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {new Date(paquete.fecha_inicio).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {new Date(paquete.fecha_fin).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {Math.abs(Math.round(paquete.coeficiente_descuento * 100))}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-24 pr-2 custom-scrollbar">
                      {paquete.habitaciones && paquete.habitaciones.length > 0 ? (
                        paquete.habitaciones.map((hab, hIdx) => (
                          <div key={hab.id || `pkg-hab-${hIdx}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <BedDouble className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="font-medium whitespace-nowrap">Piso {hab.piso} - N° {hab.numero}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Ninguna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800" title="Edición en desarrollo por backend">
                       <Info className="h-3.5 w-3.5" />
                       No editable
                     </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
