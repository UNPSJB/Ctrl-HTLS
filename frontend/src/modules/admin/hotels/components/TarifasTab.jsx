import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bed, Save, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { NumberInput } from '@form';

// Pestaña de configuración de tarifas por tipo de habitación.
// Usa el endpoint dedicado GET /hotel/:id/tarifas que devuelve tipos + precio configurado para este hotel.
export default function TarifasTab({ hotelId }) {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { precios: {} },
  });

  useEffect(() => {
    fetchTarifas();
  }, [hotelId]);

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      // Endpoint dedicado: devuelve [{ id, nombre, capacidad, precio }]
      // precio viene 0 si no tiene tarifa configurada para este hotel.
      const { data } = await axiosInstance.get(`/hotel/${hotelId}/tarifas`);
      setTarifas(data);

      // Hidratar el formulario con los precios actuales del hotel
      const initialPrecios = {};
      data.forEach((t) => {
        initialPrecios[t.id] = t.precio ?? 0;
      });
      reset({ precios: initialPrecios });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las tarifas del hotel');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Construir payload con todos los tipos que tienen precio >= 0
      const payload = tarifas.map((t) => ({
        tipoHabitacionId: t.id,
        precio: parseFloat(data.precios[t.id]) || 0,
      }));

      await axiosInstance.put(`/hotel/${hotelId}/tarifas`, { tarifas: payload });
      toast.success('Tarifas actualizadas correctamente');
      reset(data); // Marcar formulario como "no sucio" tras guardar
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || 'Error al guardar las tarifas'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tarifas y Tipos de Habitación
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure los precios base para cada tipo de habitación en este
            hotel. Estos valores se utilizarán para calcular el costo de las
            reservas y paquetes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-xs font-medium">Los precios son por noche y habitación.</p>
        </div>
      </div>

      {/* Formulario con tabla */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative flex flex-col min-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Overlay de carga */}
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Cargando tarifas del hotel..." />
            </div>
          )}

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Tipo de Habitación</th>
                <th className="px-6 py-4 font-semibold">Capacidad</th>
                <th className="px-6 py-4 font-semibold text-right">Precio Base ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tarifas.map((tipo) => {
                const hasError = !!errors.precios?.[tipo.id];
                return (
                  <tr
                    key={tipo.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
                    {/* Nombre del tipo */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Bed className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {tipo.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Capacidad */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {tipo.capacidad}{' '}
                        {tipo.capacidad === 1 ? 'persona' : 'personas'}
                      </span>
                    </td>

                    {/* Input de precio */}
                    <td className="px-6 py-4 text-right">
                      <div className="ml-auto max-w-[160px]">
                        <NumberInput
                          step="0.01"
                          {...register(`precios.${tipo.id}`, {
                            min: { value: 0, message: 'Mínimo 0' },
                            validate: (val) =>
                              val === '' || !isNaN(val) || 'Valor inválido',
                          })}
                          placeholder="0.00"
                          icon={true}
                          className="text-right"
                          hideError={false}
                          error={errors.precios?.[tipo.id]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Estado vacío */}
              {!loading && tarifas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-sm text-gray-400">
                    No hay tipos de habitación configurados para este hotel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Actualizar Tarifas Base
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
