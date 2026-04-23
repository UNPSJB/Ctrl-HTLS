import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Bed, Save, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import Modal from '@/components/ui/Modal';
import { NumberInput } from '@form';
import AppButton from '@/components/ui/AppButton';

// Pestaña de configuración de tarifas por tipo de habitación.
export default function TarifasTab({ hotelId, isActive = false }) {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { precios: {}, activos: {} },
    mode: 'onChange'
  });

  const watchActivos = useWatch({ control, name: 'activos' });

  useEffect(() => {
    if (isActive) {
      fetchTarifas();
    }
  }, [hotelId, isActive]);

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/hotel/${hotelId}/tarifas`);
      setTarifas(data);

      const initialPrecios = {};
      const initialActivos = {};
      data.forEach((t) => {
        initialActivos[t.id] = t.precio > 0;
        initialPrecios[t.id] = t.precio > 0 ? t.precio : '';
      });
      reset({ precios: initialPrecios, activos: initialActivos });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las tarifas del hotel');
    } finally {
      setLoading(false);
    }
  };

  const executeSave = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = tarifas.map((t) => ({
        tipoHabitacionId: t.id,
        precio: data.activos[t.id] ? (parseFloat(data.precios[t.id]) || 0) : 0,
      }));

      await axiosInstance.put(`/hotel/${hotelId}/tarifas`, { tarifas: payload });
      toast.success('Tarifas actualizadas correctamente');
      
      // Actualizamos estado de UI para que refleje lo guardado
      fetchTarifas();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al guardar las tarifas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    // 1. Detectar si el usuario desactivó algún tipo de habitación que antes estaba activo
    const deactivatedTypes = tarifas.filter(t => t.precio > 0 && !data.activos[t.id]);

    if (deactivatedTypes.length > 0) {
      setLoading(true);
      try {
        // Consultar habitaciones de este hotel
        const resHab = await axiosInstance.get(`/hotel/${hotelId}/habitaciones`);
        // Filtrar habitaciones que pertenezcan a los tipos desactivados
        const affectedRooms = resHab.data.filter(h => deactivatedTypes.some(dt => dt.id === h.tipoHabitacionId));

        if (affectedRooms.length > 0) {
          const names = deactivatedTypes.map(dt => `"${dt.nombre}"`).join(', ');
          
          setConfirmData({
            affectedRooms,
            names,
            formData: data
          });
          setLoading(false);
          return; // Detenemos aquí, el Modal continuará el flujo
        }
      } catch (err) {
        toast.error("Error al validar habitaciones asociadas. Intente nuevamente.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // 2. Ejecutar el guardado normal de las Tarifas
    await executeSave(data);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex-shrink-0 flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div className="max-w-2xl space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            Tarifas y Disponibilidad
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Habilite las categorías que su hotel ofrece estableciendo su precio base. Desactive categorías para inhabilitarlas del inventario.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium">Los precios son por noche. Las categorías inactivas ocultan sus habitaciones.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
        <div className="h-full relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Verificando tarifas y disponibilidad..." />
            </div>
          )}

          <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/3">Tipo de Habitación</th>
                <th className="px-6 py-4 font-semibold text-center w-1/4">Capacidad</th>
                <th className="px-6 py-4 font-semibold text-center w-32">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Precio Base ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tarifas.map((tipo) => {
                const isActiveToggled = watchActivos?.[tipo.id];
                const hasError = !!errors.precios?.[tipo.id];
                
                return (
                  <tr
                    key={tipo.id}
                    className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30 ${!isActiveToggled ? 'opacity-60 bg-gray-50/30 dark:bg-gray-800/30 grayscale-[20%]' : ''}`}
                  >
                    {/* Nombre del tipo */}
                    <td className="whitespace-nowrap px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isActiveToggled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          <Bed className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm transition-colors ${isActiveToggled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {tipo.nombre}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Capacidad */}
                    <td className="px-6 py-3 text-center">
                      <span className={`text-sm transition-colors ${isActiveToggled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {tipo.capacidad} {tipo.capacidad === 1 ? 'persona' : 'personas'}
                      </span>
                    </td>

                    {/* Switch de Estado */}
                    <td className="px-6 py-3 text-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          {...register(`activos.${tipo.id}`, {
                            onChange: () => trigger(`precios.${tipo.id}`) // revalidar el precio al apagar/encender
                          })}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </td>

                    {/* Input de precio */}
                    <td className="px-6 py-3 text-right">
                      <div className="ml-auto max-w-[180px]">
                        {isActiveToggled ? (
                          <>
                            <NumberInput
                              step="0.01"
                              min="0.01"
                              max="9999999"
                              {...register(`precios.${tipo.id}`, {
                                validate: (val) => {
                                  if (!val) return 'Se requiere precio';
                                  const num = parseFloat(val);
                                  if (isNaN(num)) return 'No es un número';
                                  if (num <= 0) return 'Debe ser mayor a 0';
                                  if (num > 9999999) return 'Máximo $9.999.999';
                                  return true;
                                },
                              })}
                              placeholder="Ej: 15000"
                              icon={true}
                              className="text-right font-medium text-lg h-11"
                              error={hasError}
                            />
                            {hasError && (
                              <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle className="h-3 w-3" />
                                {errors.precios[tipo.id]?.message}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex h-11 items-center justify-end px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                            No disponible
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Estado vacío */}
              {!loading && tarifas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-sm text-gray-400">
                    No hay tipos de habitación configurados a nivel sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="flex-shrink-0 mt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 pb-2">
          <AppButton
            type="submit"
            disabled={isSubmitting || !isValid || loading}
            loading={isSubmitting}
            icon={Save}
          >
            Guardar Tarifario y Disp.
          </AppButton>
        </div>
      </form>

      <Modal
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        title="Desactivación en Cascada"
        description="Se detectaron habitaciones que dependen de esta tarifa."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="amber"
        confirmIcon={AlertTriangle}
        onConfirm={async () => {
          if (!confirmData) return;
          try {
            setIsSubmitting(true);
            setConfirmData(null); // cerramos modal
            
            await Promise.all(confirmData.affectedRooms.map(room => 
              axiosInstance.delete(`/hotel/${hotelId}/habitacion/${room.id}`)
            ));
            toast.success(`Se desactivaron ${confirmData.affectedRooms.length} habitaciones en cascada.`);
            
            await executeSave(confirmData.formData);
          } catch (error) {
            console.error(error);
            toast.error("Error al procesar la eliminación en cascada");
            setIsSubmitting(false);
          }
        }}
      >
        <div className="text-gray-700 dark:text-gray-300 space-y-3 pb-2 pt-1">
          <p>
            Al desactivar <span className="font-semibold text-gray-900 dark:text-gray-100">{confirmData?.names}</span>, se afectará a <b>{confirmData?.affectedRooms.length} habitación(es) física(s)</b> registrada(s) actualmente en el sistema bajo estos tipos.
          </p>
          <p>
            Si continúa, estas habitaciones quedarán desactivadas e invalidadas permanentemente para futuros alquileres.
          </p>
        </div>
      </Modal>
    </div>
  );
}
