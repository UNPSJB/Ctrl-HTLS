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
import HabitacionesList from './HabitacionesList';

const EMPTY_ARRAY = [];

/**
 * Listado gestionable de habitaciones para un hotel.
 * Implementa CRUD completo: Listar, Crear, Editar, Eliminar.
 */
export default function HabitacionesTab({
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



  // Filtrar tipos que tienen precio asignado en este hotel
  const tiposFiltrados = isLocalMode
    ? tiposGlobales
    : tiposGlobales.filter((t) =>
        tarifasAsignadas.some((ta) => ta.tipoHabitacionId === t.id)
      );

  const inputClass = (error) =>
    `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 transition-all shadow-sm`;

  const labelClass = 'mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-700 dark:text-gray-300';
  const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

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
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
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
            className="grid grid-cols-1 gap-6 md:grid-cols-4 items-start"
          >
            <div>
              <label className={labelClass}>
                <Hash className="h-3.5 w-3.5 text-blue-500" /> Número
              </label>
              <input
                type="number"
                {...register('numero', { required: 'Campo obligatorio' })}
                className={inputClass(errors.numero)}
                placeholder="Ej: 101"
              />
              {errors.numero && (
                <p className={errorClass}>
                  {errors.numero.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <Layers className="h-3.5 w-3.5 text-blue-500" /> Piso
              </label>
              <input
                type="number"
                {...register('piso', { required: 'Campo obligatorio' })}
                className={inputClass(errors.piso)}
                placeholder="Ej: 1"
              />
              {errors.piso && (
                <p className={errorClass}>
                  {errors.piso.message}
                </p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className={labelClass}>
                <Bed className="h-3.5 w-3.5 text-blue-500" /> Tipo
              </label>
              <select
                {...register('tipoHabitacionId', {
                  required: 'Campo obligatorio',
                })}
                className={inputClass(errors.tipoHabitacionId)}
              >
                <option value="">Seleccione tipo...</option>
                {tiposFiltrados.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              {errors.tipoHabitacionId && (
                <p className={errorClass}>
                  {errors.tipoHabitacionId.message}
                </p>
              )}
            </div>

            <div className="flex flex-col h-full pt-[21px]">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {editingId ? 'Guardar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Habitaciones */}
      <HabitacionesList
        data={sortedRooms}
        tiposGlobales={tiposGlobales}
        loading={loading}
        isCreating={isCreating}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
