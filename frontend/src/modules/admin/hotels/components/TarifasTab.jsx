import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bed, Save, Info, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

export default function TarifasTab({ hotelId, hotelTarifas }) {
  const [tiposGlobales, setTiposGlobales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      tarifas: {}
    }
  });

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/obtener-tiposHabitaciones');
      const tipos = response.data;
      setTiposGlobales(tipos);

      const initialTarifas = {};
      tipos.forEach((tipo) => {
        const tarifaExistente = hotelTarifas?.find(
          (t) => t.tipoHabitacionId === tipo.id
        );
        initialTarifas[tipo.id] = tarifaExistente ? tarifaExistente.precio : '';
      });
      
      reset({ tarifas: initialTarifas });
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los tipos de habitación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = Object.entries(data.tarifas)
        .filter(([, precio]) => precio !== '' && precio !== null)
        .map(([id, precio]) => ({
          tipoHabitacionId: parseInt(id),
          precio: parseFloat(precio),
        }));

      if (payload.length === 0) {
        toast.error('Debe ingresar al menos un precio');
        setIsSubmitting(false);
        return;
      }

      await axiosInstance.put(`/hotel/${hotelId}/tarifas`, {
        tarifas: payload,
      });

      toast.success('Tarifas actualizadas correctamente');
      reset(data); // Marcar como no sucio tras guardar exitoso
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error('Funcionalidad de guardado pendiente en Backend.');
      } else {
        toast.error('Error al guardar las tarifas');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* FILA 1: Encabezado e Información */}
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
          <p className="text-xs font-medium">
            Los precios son por noche y habitación.
          </p>
        </div>
      </div>

      {/* FILA 2: Grid de Configuración */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative flex flex-col min-h-[400px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
              <InnerLoading message="Cargando tipos y tarifas..." />
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold text-center md:text-left">Tipo de Habitación</th>
                <th className="px-6 py-4 font-semibold">Capacidad</th>
                <th className="px-6 py-4 font-semibold text-right">Precio Base ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tiposGlobales.map((tipo) => {
                const hasError = !!errors.tarifas?.[tipo.id];
                return (
                  <tr
                    key={tipo.id}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {tipo.capacidad}{' '}
                        {tipo.capacidad === 1 ? 'persona' : 'personas'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative ml-auto max-w-[150px]">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${hasError ? 'text-red-400' : 'text-gray-400'}`}>
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`tarifas.${tipo.id}`, {
                            min: { value: 0, message: 'Mínimo 0' },
                            validate: (val) => val === '' || !isNaN(val) || 'Invalido'
                          })}
                          placeholder="0.00"
                          className={`w-full rounded-lg border ${hasError ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 text-gray-700 focus:border-blue-500 focus:ring-blue-500/20'} py-2 pl-7 pr-3 text-right outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100`}
                        />
                        {hasError && (
                          <div className="absolute right-0 top-full mt-1 animate-in fade-in slide-in-from-top-1 text-[10px] font-bold text-red-500">
                            {errors.tarifas[tipo.id]?.message}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Alerta de bloqueo (Opcional, para que el usuario sepa que depende del backend) */}
        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold">Nota para el Administrador</p>
            <p>
              El guardado de estos precios requiere una sincronización con el
              motor de reservas central. Si el botón de guardado reporta un
              error, por favor contacte a soporte técnico para habilitar el
              módulo de tarifas atómicas.
            </p>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Actualizando...' : 'Actualizar Tarifas Base'}
          </button>
        </div>
      </form>
      {/* Nota Informativa */}
    </div>
  );
}
