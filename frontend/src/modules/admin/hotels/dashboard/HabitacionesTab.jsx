import { useState, useEffect } from 'react';
import { Plus, DoorOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import HabitacionesList from '../components/HabitacionesList';
import HabitacionFormModal from '../components/HabitacionFormModal';
import AppButton from '@/components/ui/AppButton';

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
  isActive = false,
}) {
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposGlobales, setTiposGlobales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState(null);
  const [tarifasCompletas, setTarifasCompletas] = useState([]);

  const isLocalMode = !hotelId;

  // Carga inicial de tipos globales
  useEffect(() => {
    fetchGlobalTypes();
  }, []);

  // Carga de habitaciones según el modo
  useEffect(() => {
    if (!isLocalMode) {
      if (isActive) {
        fetchHabitaciones();
      }
    } else {
      setHabitaciones(localRooms);
    }
  }, [hotelId, isLocalMode, localRooms, isActive]);

  const fetchGlobalTypes = async () => {
    try {
      const res = await axiosInstance.get('/obtener-tiposHabitaciones');
      setTiposGlobales(res.data);
    } catch (error) {
      console.error('Error fetching room types', error);
    }
  };

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

  const handleSave = async (payload, habitacion) => {
    try {
      if (isLocalMode) {
        if (habitacion) {
          const updated = habitaciones.map((h) =>
            h.tempId === habitacion.tempId ? { ...payload, tempId: habitacion.tempId } : h
          );
          onLocalChange(updated);
          toast.success('Borrador actualizado');
        } else {
          const newRoom = { ...payload, tempId: Date.now() };
          onLocalChange([...habitaciones, newRoom]);
          toast.success('Borrador agregado');
        }
      } else {
        if (habitacion) {
          await axiosInstance.put(
            `/hotel/${hotelId}/habitacion/${habitacion.id}`,
            payload
          );
          toast.success('Habitación actualizada correctamente');
        } else {
          await axiosInstance.post(`/hotel/${hotelId}/habitacion`, [payload]);
          toast.success('Habitación creada correctamente');
        }
        fetchHabitaciones();
      }

      setIsCreating(false);
      setEditingHabitacion(null);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || 'Error al procesar habitación'
      );
      throw error; // Para que el modal quite el estado de cargando
    }
  };

  const handleDelete = async (habitacionId, tempId) => {
    if (!window.confirm('¿Está seguro de desactivar esta habitación física? Quedará invalidada para futuros alquileres.'))
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
        toast.success('Habitación desactivada');
        fetchHabitaciones();
      } catch (error) {
        console.error(error);
        toast.error('Error al desactivar la habitación');
      }
    }
  };

  const startEdit = (habitacion) => {
    setEditingHabitacion(habitacion);
    setIsCreating(true);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingHabitacion(null);
  };

  // Filtrar tipos que tienen precio asignado en este hotel
  const sourceTarifas = hotelId ? tarifasCompletas : tarifasAsignadas;
  const tiposFiltrados = isLocalMode
    ? tiposGlobales
    : tiposGlobales
      .map((t) => {
        const matchingTarifa = sourceTarifas.find(
          (ta) => Number(ta.tipoHabitacionId || ta.id) === Number(t.id)
        );
        if (!matchingTarifa || Number(matchingTarifa.precio) === 0) return null;
        return {
          ...t,
          precio: matchingTarifa.precio,
        };
      })
      .filter(Boolean);


  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <DoorOpen className="h-5 w-5 text-blue-500" />
            Control de Habitaciones Físicas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administre las unidades reales del hotel, asignando su ubicación y tipo.
          </p>
        </div>

        <AppButton
          onClick={() => {
            setEditingHabitacion(null);
            setIsCreating(true);
          }}
          disabled={loading}
          icon={Plus}
        >
          Registrar Habitación
        </AppButton>
      </div>

      <div className="flex-grow mt-6 flex flex-col overflow-hidden relative">
        <HabitacionFormModal
          isOpen={isCreating}
          onClose={cancelForm}
          habitacion={editingHabitacion}
          tiposFiltrados={tiposFiltrados}
          onSave={handleSave}
        />

        <HabitacionesList
          data={habitaciones}
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
