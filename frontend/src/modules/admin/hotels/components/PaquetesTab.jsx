import { useState, useEffect } from 'react';
import { Tag, Plus, Info, Calendar as CalendarIcon, Users, BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import PaquetesList from './PaquetesList';

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

  const inputClass = (error) =>
    `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm md:text-base text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all shadow-sm`;

  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400';
  const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

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
          disabled={loadingInitial}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          {showForm ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nuevo Paquete'}
        </button>
      </div>

      {showForm && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 duration-300 dark:border-blue-900/20 dark:bg-blue-900/10">
          <form onSubmit={handleSubmit(handleCreatePaquete)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-1">
                <label className={labelClass}>Nombre del Paquete</label>
                <input
                  type="text"
                  placeholder="Ej: Finde Romántico"
                  {...register('nombre', { required: 'Requerido' })}
                  className={inputClass(errors.nombre)}
                />
                {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Desde</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('fecha_inicio', { required: 'Requerido' })}
                  className={inputClass(errors.fecha_inicio)}
                />
                {errors.fecha_inicio && <p className={errorClass}>{errors.fecha_inicio.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Hasta</label>
                <input
                  type="date"
                  min={fechaInicio || new Date().toISOString().split('T')[0]}
                  {...register('fecha_fin', { required: 'Requerido' })}
                  className={inputClass(errors.fecha_fin)}
                />
                {errors.fecha_fin && <p className={errorClass}>{errors.fecha_fin.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 20.00"
                  {...register('coeficiente_descuento', { required: 'Requerido', min: 0.1, max: 100 })}
                  className={inputClass(errors.coeficiente_descuento)}
                />
                {errors.coeficiente_descuento && <p className={errorClass}>Valor inválido</p>}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Seleccione las habitaciones a incluir:
              </label>
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">Inclusión</th>
                        <th className="px-6 py-4">Piso - Número</th>
                        <th className="px-6 py-4">Tipo de Habitación</th>
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
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
              <button
                type="submit"
                disabled={loadingAction}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingAction ? (
                   <>
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                   Guardando...
                 </>
                ) : 'Crear Paquete'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Paquetes */}
      <PaquetesList data={paquetes} loading={loadingInitial} />

    </div>
  );
}
