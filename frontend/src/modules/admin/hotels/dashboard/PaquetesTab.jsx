import { useState, useEffect } from 'react';
import { Tag, Plus, BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { toISODate } from '@/utils/dateUtils';
import PaquetesList from '../components/PaquetesList';
import { Modal } from '@admin-ui';
import {
  FormField,
  TextInput,
  NumberInput
} from '@form';

export default function PaquetesTab({ hotelId, isActive = false }) {
  const [paquetes, setPaquetes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // Guarda el paquete que se está editando (null = modo crear)
  const [editingPaquete, setEditingPaquete] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  // Fecha mínima = hoy en formato YYYY-MM-DD (zona local Argentina)
  const hoy = toISODate(new Date());

  // Observar fecha inicio para limitar fecha fin
  const fechaInicio = watch('fecha_inicio');

  useEffect(() => {
    if (isActive) {
      fetchData();
    }
  }, [hotelId, isActive]);

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

  // Abre el modal en modo creación
  const handleOpenCreate = () => {
    setEditingPaquete(null);
    reset({
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
      coeficiente_descuento: '',
      habitaciones: [],
    });
    setShowForm(true);
  };

  // Abre el modal en modo edición y pre-rellena el formulario
  const handleOpenEdit = (paquete) => {
    setEditingPaquete(paquete);

    // Formatear fechas a yyyy-MM-dd para el input type=date
    const formatDate = (iso) => iso ? iso.split('T')[0] : '';

    // Los IDs de las habitaciones del paquete (como strings para los checkboxes)
    const habitacionIds = (paquete.habitaciones || []).map(h => String(h.id));

    reset({
      nombre: paquete.nombre || '',
      fecha_inicio: formatDate(paquete.fecha_inicio),
      fecha_fin: formatDate(paquete.fecha_fin),
      coeficiente_descuento: Math.abs(Math.round(paquete.coeficiente_descuento * 100)),
      habitaciones: habitacionIds,
    });
    setShowForm(true);
  };

  // Handler unificado: crea o actualiza según el estado de editingPaquete
  const handleSavePaquete = async (data) => {
    const habitacionesSeleccionadas = Array.isArray(data.habitaciones) ? data.habitaciones : [];
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
        coeficiente_descuento: parseFloat(data.coeficiente_descuento) / 100,
        habitaciones: habitacionesSeleccionadas.map(id => parseInt(id, 10)),
      };

      if (editingPaquete) {
        // Modo edición
        await axiosInstance.put(`/hotel/${hotelId}/paquete-promocional/${editingPaquete.id}`, payload);
        toast.success('Paquete actualizado exitosamente');
      } else {
        // Modo creación
        await axiosInstance.post(`/hotel/${hotelId}/paquete-promocional`, payload);
        toast.success('Paquete creado exitosamente');
      }

      setShowForm(false);
      setEditingPaquete(null);
      reset();
      fetchData();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || (editingPaquete ? 'Error al actualizar el paquete' : 'Error al crear el paquete promocional');
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  // Elimina un paquete con confirmación
  const handleDeletePaquete = async (idPaquete) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este paquete promocional?')) return;

    try {
      await axiosInstance.delete(`/hotel/${hotelId}/paquete-promocional/${idPaquete}`);
      toast.success('Paquete eliminado');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al eliminar el paquete');
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingPaquete(null);
    reset();
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-blue-500" />
            Paquetes Turísticos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cree ofertas combinando múltiples habitaciones por un precio especial.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={loadingInitial}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nuevo Paquete
        </button>
      </div>

      <div className="flex-grow flex flex-col mt-6 overflow-hidden relative">
        {/* Modal de Crear/Editar Paquete */}
        <Modal
          isOpen={showForm}
          onClose={handleCloseModal}
          title={editingPaquete ? `Editar: ${editingPaquete.nombre}` : 'Crear Paquete Promocional'}
          description={editingPaquete ? 'Modifique los datos del paquete promocional.' : 'Agrupe habitaciones y defina un descuento especial para este periodo.'}
          onConfirm={handleSubmit(handleSavePaquete)}
          loading={loadingAction}
          confirmDisabled={!isValid || loadingAction}
          confirmLabel={editingPaquete ? 'Guardar Cambios' : 'Crear Paquete'}
          confirmIcon={Plus}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <FormField label="Nombre del Paquete" required error={errors.nombre}>
                  <TextInput
                    placeholder="Ej: Finde Romántico"
                    {...register('nombre', {
                      required: 'El nombre del paquete es obligatorio',
                      maxLength: { value: 80, message: 'Máximo 80 caracteres' },
                    })}
                  />
                </FormField>
              </div>
              <FormField label="Desde" required error={errors.fecha_inicio}>
                <TextInput
                  type="date"
                  min={hoy}
                  {...register('fecha_inicio', {
                    required: 'La fecha de inicio es obligatoria',
                    validate: (val) => val >= hoy || 'No se permiten fechas pasadas',
                  })}
                />
              </FormField>
              <FormField label="Hasta" required error={errors.fecha_fin}>
                <TextInput
                  type="date"
                  min={fechaInicio || hoy}
                  {...register('fecha_fin', {
                    required: 'La fecha de fin es obligatoria',
                    validate: (val) => {
                      if (val < hoy) return 'No se permiten fechas pasadas';
                      if (fechaInicio && val < fechaInicio) return 'Debe ser igual o posterior al inicio';
                      return true;
                    },
                  })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField label="Descuento (%)" required error={errors.coeficiente_descuento}>
                <NumberInput
                  step="1"
                  min="1"
                  max="100"
                  placeholder="Ej: 20"
                  {...register('coeficiente_descuento', {
                    required: 'El descuento es obligatorio',
                    min: { value: 1, message: 'El descuento mínimo es 1%' },
                    max: { value: 100, message: 'El descuento máximo es 100%' },
                  })}
                />
              </FormField>
            </div>

            {/* Selector de habitaciones */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-blue-500" />
                Habitaciones a incluir
              </label>
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/90 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">Incluir</th>
                        <th className="px-6 py-4">Piso - Número</th>
                        <th className="px-6 py-4">Tipo</th>
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
                          <tr
                            key={hab.id || `hab-${hab.piso}-${hab.numero}-${idx}`}
                            className="transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-900/20"
                          >
                            <td className="px-4 py-3 text-center align-middle">
                              <input
                                type="checkbox"
                                value={String(hab.id)}
                                {...register('habitaciones')}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-gray-600 dark:bg-gray-700 transition-all"
                              />
                            </td>
                            <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">
                              Piso {hab.piso} - N° {hab.numero}
                            </td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
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
          </div>
        </Modal>

        {/* Listado de Paquetes */}
        <PaquetesList
          data={paquetes}
          loading={loadingInitial}
          onEdit={handleOpenEdit}
          onDelete={handleDeletePaquete}
        />
      </div>
    </div>
  );
}
