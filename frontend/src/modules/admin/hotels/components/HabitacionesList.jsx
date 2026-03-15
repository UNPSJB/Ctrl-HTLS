import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  DoorOpen,
  Layers,
  Hash,
  Bed,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

const EMPTY_ARRAY = [];

/**
 * Listado gestionable de habitaciones para un hotel.
 * Implementa CRUD completo: Listar, Crear, Editar, Eliminar.
 */
export default function HabitacionesList({
  hotelId,
  localRooms = EMPTY_ARRAY,
  tarifasAsignadas = EMPTY_ARRAY,
  onLocalChange,
}) {
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposGlobales, setTiposGlobales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const isLocalMode = !hotelId;

  // Carga inicial de tipos globales
  useEffect(() => {
    fetchGlobalTypes();
  }, []);

  // Carga de habitaciones según el modo
  useEffect(() => {
    if (!isLocalMode) {
      fetchHabitaciones();
    } else {
      setHabitaciones(localRooms);
    }
    // No incluimos localRooms aquí si esLocalMode es falso,
    // y usamos EMPTY_ARRAY como default para evitar loops de referencia.
  }, [hotelId, isLocalMode, localRooms]);

  // Carga todos los tipos de habitación disponibles en el sistema
  const fetchGlobalTypes = async () => {
    try {
      const res = await axiosInstance.get('/obtener-tiposHabitaciones');
      setTiposGlobales(res.data);
    } catch (error) {
      console.error('Error fetching room types', error);
    }
  };

  // Carga habitaciones existentes del servidor para este hotel
  const fetchHabitaciones = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/hotel/${hotelId}/habitaciones`);
      setHabitaciones(res.data);
    } catch (error) {
      console.error('Failed to fetch habitaciones', error);
      toast.error('Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        numero: Number(data.numero),
        piso: Number(data.piso),
        idTipoHabitacion: Number(data.tipoHabitacionId),
      };

      if (isLocalMode) {
        if (editingId) {
          const updated = habitaciones.map((h) =>
            h.tempId === editingId ? { ...payload, tempId: editingId } : h
          );
          onLocalChange(updated);
          toast.success('Borrador actualizado');
        } else {
          const newRoom = { ...payload, tempId: Date.now() };
          onLocalChange([...habitaciones, newRoom]);
          toast.success('Borrador agregado');
        }
      } else {
        if (editingId) {
          await axiosInstance.put(
            `/hotel/${hotelId}/habitacion/${editingId}`,
            payload
          );
          toast.success('Habitación actualizada correctamente');
        } else {
          // El backend espera un objeto con una propiedad 'habitaciones' o un arreglo directo dependiendo del controller
          // Según el controller, setHabitaciones soporta payload directo o array
          await axiosInstance.post(`/hotel/${hotelId}/habitacion`, [payload]);
          toast.success('Habitación creada correctamente');
        }
        fetchHabitaciones();
      }

      setIsCreating(false);
      setEditingId(null);
      reset();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || 'Error al procesar habitación'
      );
    }
  };

  const handleDelete = async (habitacionId, tempId) => {
    if (!window.confirm('¿Está seguro de eliminar esta habitación física?'))
      return;

    if (isLocalMode) {
      const updated = habitaciones.filter((h) => h.tempId !== tempId);
      onLocalChange(updated);
      toast.success('Eliminado del borrador');
    } else {
      try {
        await axiosInstance.delete(
          `/hotel/${hotelId}/habitacion/${habitacionId}`
        );
        toast.success('Habitación eliminada');
        fetchHabitaciones();
      } catch (error) {
        console.error(error);
        toast.error('Error al eliminar la habitación');
      }
    }
  };

  const startEdit = (habitacion) => {
    setEditingId(isLocalMode ? habitacion.tempId : habitacion.id);
    setIsCreating(true);
    setValue('numero', habitacion.numero);
    setValue('piso', habitacion.piso);
    setValue('tipoHabitacionId', habitacion.tipoHabitacionId);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    reset();
  };

  // Ordenamiento estable por Piso y luego por Número
  const sortedRooms = [...habitaciones].sort((a, b) => {
    if (a.piso !== b.piso) return a.piso - b.piso;
    return a.numero - b.numero;
  });

  if (loading && !isCreating)
    return <InnerLoading message="Cargando inventario..." />;

  // Filtrar tipos que tienen precio asignado en este hotel
  const tiposFiltrados = isLocalMode
    ? tiposGlobales
    : tiposGlobales.filter((t) =>
        tarifasAsignadas.some((ta) => ta.tipoHabitacionId === t.id)
      );

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Encabezado con estadísticas rápidas o descripción */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <DoorOpen className="h-5 w-5 text-blue-500" />
            Control de Habitaciones Físicas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administre las unidades reales del hotel, asignando su ubicación y
            tipo.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Registrar Habitación
          </button>
        )}
      </div>

      {/* Formulario de Alta/Edición */}
      {isCreating && (
        <div className="animate-in slide-in-from-top-4 rounded-xl border border-gray-200 bg-gray-50 p-6 duration-300 dark:border-gray-700 dark:bg-gray-700/30">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              {editingId ? 'Editando Habitación' : 'Nueva Habitación'}
            </h3>
            <button
              onClick={cancelForm}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 md:grid-cols-4"
          >
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                <Hash className="h-3 w-3" /> Número
              </label>
              <input
                type="number"
                {...register('numero', { required: 'Campo obligatorio' })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Ej: 101"
              />
              {errors.numero && (
                <span className="text-xs text-red-500">
                  {errors.numero.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                <Layers className="h-3 w-3" /> Piso
              </label>
              <input
                type="number"
                {...register('piso', { required: 'Campo obligatorio' })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Ej: 1"
              />
              {errors.piso && (
                <span className="text-xs text-red-500">
                  {errors.piso.message}
                </span>
              )}
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                < Bed className="h-3 w-3" /> Tipo
              </label>
              <select
                {...register('tipoHabitacionId', {
                  required: 'Campo obligatorio',
                })}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-right bg-no-repeat px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Seleccione tipo...</option>
                {tiposFiltrados.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              {errors.tipoHabitacionId && (
                <span className="text-xs text-red-500">
                  {errors.tipoHabitacionId.message}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="hidden text-xs font-bold opacity-0 md:block">
                Acción
              </label>
              <button
                type="submit"
                className="flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {editingId ? 'Guardar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Habitaciones */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Habitación</th>
              <th className="px-6 py-4 font-semibold">Ubicación</th>
              <th className="px-6 py-4 font-semibold">Categoría / Tipo</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedRooms.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-8 w-8 text-gray-300" />
                    <p>
                      No hay habitaciones físicas registradas en este hotel.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRooms.map((habitacion) => {
                const tipo =
                  tiposGlobales.find(
                    (t) => t.id === Number(habitacion.tipoHabitacionId)
                  ) || habitacion.tipoHabitacion;
                return (
                  <tr
                    key={habitacion.id || habitacion.tempId}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <span className="text-blue-600">#</span>
                        {habitacion.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Layers className="h-3 w-3" />
                        Piso {habitacion.piso}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {tipo?.nombre || 'Tipo no definido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(habitacion)}
                          className="p-1.5 text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(habitacion.id, habitacion.tempId)
                          }
                          className="p-1.5 text-slate-400 transition-colors hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
