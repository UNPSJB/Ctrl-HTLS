import { useState, useEffect } from 'react';
import { Plus, BedDouble, Search, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { toISODate } from '@/utils/dateUtils';
import { Modal } from '@admin-ui';
import AppButton from '@/components/ui/AppButton';
import { FormField, TextInput, NumberInput } from '@form';
import { RULES, LIMITS } from '@/utils/validationRules';

export default function PaqueteFormModal({
  isOpen,
  onClose,
  hotelId,
  paquete = null, // null significa modo creación
  onSuccess
}) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  const hoy = toISODate(new Date());
  const fechaInicio = watch('fecha_inicio');
  const selectedHabitaciones = watch('habitaciones') || [];

  // Configurar el formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (paquete) {
        // Modo edición
        const formatDate = (iso) => iso ? iso.split('T')[0] : '';
        const fInicio = formatDate(paquete.fecha_inicio);
        const fFin = formatDate(paquete.fecha_fin);
        const habitacionIds = (paquete.habitaciones || []).map(h => String(h.id));

        reset({
          nombre: paquete.nombre || '',
          fecha_inicio: fInicio,
          fecha_fin: fFin,
          coeficiente_descuento: Math.abs(Math.round(paquete.coeficiente_descuento * 100)),
          habitaciones: habitacionIds,
        });

        if (fInicio && fFin) {
          fetchDisponibilidad(fInicio, fFin, paquete.habitaciones || []);
        } else {
          setAvailableRooms(null);
        }
      } else {
        // Modo creación
        reset({
          nombre: '',
          fecha_inicio: '',
          fecha_fin: '',
          coeficiente_descuento: '',
          habitaciones: [],
        });
        setAvailableRooms(null);
      }
    } else {
      // Limpiar al cerrar
      setAvailableRooms(null);
      reset();
    }
  }, [isOpen, paquete, reset, hotelId]);

  const fetchDisponibilidad = async (inicio, fin, preSelectedRooms = []) => {
    try {
      setIsSearching(true);
      const res = await axiosInstance.get(`/hotel/${hotelId}/disponibilidad?fechaInicio=${inicio}&fechaFin=${fin}`);

      let data = [];
      if (Array.isArray(res.data)) {
        data = [...res.data];
      } else if (res.data && Array.isArray(res.data.habitaciones)) {
        data = [...res.data.habitaciones];
      } else if (res.data && Array.isArray(res.data.data)) {
        data = [...res.data.data];
      }

      if (preSelectedRooms.length > 0) {
        preSelectedRooms.forEach(room => {
          const tipoNombre = room.tipoHabitacion?.nombre || 'Habitación';
          let group = data.find(g => Object.keys(g).includes(tipoNombre));
          if (!group) {
            group = { [tipoNombre]: [], precio: room.tipoHabitacion?.precio || 0, capacidad: room.tipoHabitacion?.capacidad || 0 };
            data.push(group);
          }
          const exists = group[tipoNombre].some(r => Number(r.id) === Number(room.id));
          if (!exists) {
            group[tipoNombre].push({
              id: room.id,
              numero: room.numero,
              piso: room.piso
            });
          }
        });
      }
      setAvailableRooms(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al buscar disponibilidad');
      setAvailableRooms([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (data) => {
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

      if (paquete) {
        await axiosInstance.put(`/hotel/${hotelId}/paquete-promocional/${paquete.id}`, payload);
        toast.success('Paquete actualizado exitosamente');
      } else {
        await axiosInstance.post(`/hotel/${hotelId}/paquete-promocional`, payload);
        toast.success('Paquete creado exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || (paquete ? 'Error al actualizar el paquete' : 'Error al crear el paquete promocional');
      toast.error(errorMsg);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paquete ? `Editar: ${paquete.nombre}` : 'Crear Paquete Promocional'}
      description={paquete ? 'Modifique los datos del paquete promocional.' : 'Agrupe habitaciones y defina un descuento especial para este periodo.'}
      onConfirm={handleSubmit(handleSave)}
      loading={loadingAction}
      confirmDisabled={!isValid || loadingAction}
      confirmLabel={paquete ? 'Guardar Cambios' : 'Crear Paquete'}
      confirmIcon={Plus}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <FormField label="Nombre del Paquete" required error={errors.nombre}>
              <TextInput
                placeholder="Ej: Finde Romántico"
                maxLength={LIMITS.nombrePaquete}
                {...register('nombre', {
                  required: 'El nombre del paquete es obligatorio',
                  ...RULES.nombrePaquete,
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
                valueAsNumber: true,
                min: { value: 1, message: 'El descuento mínimo es 1%' },
                max: { value: 100, message: 'El descuento máximo es 100%' },
              })}
            />
          </FormField>

          <div className="flex items-end">
            <AppButton
              type="button"
              variant="outline"
              icon={Search}
              loading={isSearching}
              disabled={isSearching || !watch('fecha_inicio') || !watch('fecha_fin')}
              onClick={() => fetchDisponibilidad(watch('fecha_inicio'), watch('fecha_fin'), paquete?.habitaciones || [])}
              className="w-full h-10"
            >
              Buscar Habitaciones Libres
            </AppButton>
          </div>
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
                    <th className="px-6 py-4">Habitación</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4">Categoría / Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {availableRooms === null ? (
                    <tr key="empty-search">
                      <td colSpan="4" className="px-4 py-10 text-center text-sm text-gray-500 italic">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        Seleccione las fechas y haga clic en Buscar para ver disponibilidad.
                      </td>
                    </tr>
                  ) : (!Array.isArray(availableRooms) || availableRooms.length === 0) ? (
                    <tr key="empty-rooms">
                      <td colSpan="4" className="px-4 py-10 text-center text-sm text-gray-500 italic">
                        <BedDouble className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        No hay habitaciones disponibles en las fechas seleccionadas.
                      </td>
                    </tr>
                  ) : (
                    availableRooms.flatMap(group => {
                      const tipo = Object.keys(group).find(k => k !== 'precio' && k !== 'capacidad');
                      return (group[tipo] || []).map(room => ({
                        ...room,
                        tipoNombre: tipo,
                        precio: group.precio,
                        capacidad: group.capacidad
                      }));
                    }).map((hab, idx) => {
                      const wasOriginal = paquete?.habitaciones?.some(h => String(h.id) === String(hab.id));
                      const isUnselected = wasOriginal && !selectedHabitaciones.includes(String(hab.id));

                      return (
                        <tr
                          key={hab.id || `hab-${hab.piso}-${hab.numero}-${idx}`}
                          className={`transition-colors ${isUnselected ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20' : 'hover:bg-blue-50/30 dark:hover:bg-blue-900/10 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-900/20'}`}
                        >
                          <td className="px-4 py-3 text-center align-middle">
                            <input
                              type="checkbox"
                              value={String(hab.id)}
                              {...register('habitaciones')}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-gray-600 dark:bg-gray-700 transition-all"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                              <span className="text-blue-600">#</span>
                              {hab.numero}
                              {isUnselected && (
                                <span className="ml-2 inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  ¿Quitar?
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <Layers className="h-3 w-3" />
                              Piso {hab.piso}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                              {hab.tipoNombre}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
