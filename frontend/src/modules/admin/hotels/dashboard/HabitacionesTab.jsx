import { useState, useEffect } from 'react';
import {
  Plus,
  DoorOpen,
  Layers,
  Hash,
  Bed,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import HabitacionesList from '../components/HabitacionesList';
import { ActionModal } from '@admin-ui';
import {
  FormField,
  SelectInput,
  NumberInput
} from '@form';

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
  const [submitting, setSubmitting] = useState(false);
  const [tarifasCompletas, setTarifasCompletas] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange'
  });

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
      const [resHab, resTar] = await Promise.all([
        axiosInstance.get(`/hotel/${hotelId}/habitaciones`),
        axiosInstance.get(`/hotel/${hotelId}/tarifas`)
      ]);
      setHabitaciones(resHab.data);
      setTarifasCompletas(resTar.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Error al cargar datos de habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
  const sourceTarifas = hotelId ? tarifasCompletas : tarifasAsignadas;
  const tiposFiltrados = isLocalMode
    ? tiposGlobales
    : tiposGlobales
      .map((t) => {
        const matchingTarifa = sourceTarifas.find(
          (ta) => Number(ta.tipoHabitacionId || ta.id) === Number(t.id)
        );
        // Omitir si no hay tarifa o si el precio es 0 (no habilitada)
        if (!matchingTarifa || Number(matchingTarifa.precio) === 0) return null;
        return {
          ...t,
          precio: matchingTarifa.precio,
        };
      })
      .filter(Boolean);


  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Encabezado con estadísticas rápidas o descripción */}
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
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

        <button
          onClick={() => setIsCreating(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Registrar Habitación
        </button>
      </div>

      <div className="flex-grow mt-6 flex flex-col overflow-hidden relative">

      {/* Formulario de Alta/Edición en Modal */}
      <ActionModal
        isOpen={isCreating}
        onClose={cancelForm}
        title={editingId ? 'Editar Habitación' : 'Nueva Habitación'}
        description={editingId ? 'Modifique los datos de la habitación física' : 'Complete los datos para registrar una nueva unidad'}
        onConfirm={handleSubmit(onSubmit)}
        loading={submitting}
        confirmDisabled={!isValid || submitting}
        confirmLabel={editingId ? 'Guardar Cambios' : 'Registrar'}
        confirmIcon={Plus}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Número"
            required
            error={errors.numero}
            icon={Hash}
          >
            <NumberInput
              {...register('numero', { required: 'Campo obligatorio' })}
              placeholder="Ej: 101"
            />
          </FormField>

          <FormField
            label="Piso"
            required
            error={errors.piso}
            icon={Layers}
          >
            <NumberInput
              {...register('piso', { required: 'Campo obligatorio' })}
              placeholder="Ej: 1"
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField
              label="Tipo de Habitación"
              required
              error={errors.tipoHabitacionId}
              icon={Bed}
            >
              <SelectInput
                {...register('tipoHabitacionId', {
                  required: 'Campo obligatorio',
                })}
              >
                <option value="">Seleccione tipo...</option>
                {tiposFiltrados.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} {t.precio !== undefined ? `- $${t.precio}` : ''}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>
        </div>
      </ActionModal>

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

    </div>
  );
}
