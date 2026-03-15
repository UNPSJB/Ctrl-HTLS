import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, MapPin, User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@/hooks/useHotel';

import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import { InnerLoading } from '@/components/ui/InnerLoading';

export default function AjustesGeneralesTab({
  hotelId,
  initialData,
  onUpdate,
}) {
  const { categorias, loading: loadingResources } = useHotel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [activeSubTab, setActiveSubTab] = useState('general');

  const form = useForm({
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      categoriaId: '',
      paisId: '',
      provinciaId: '',
      ciudadId: '',
      encargadoNombre: '',
      encargadoApellido: '',
      encargadoTipoDocumento: '',
      encargadoNumeroDocumento: '',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre || '',
        direccion: initialData.direccion || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        categoriaId: initialData.categoriaId || '',
        paisId: initialData.ubicacion?.paisId || '',
        provinciaId: initialData.ubicacion?.provinciaId || '',
        ciudadId: initialData.ubicacion?.ciudadId || '',
        encargadoNombre: initialData.encargado?.nombre || '',
        encargadoApellido: initialData.encargado?.apellido || '',
        encargadoTipoDocumento: initialData.encargado?.tipoDocumento || '',
        encargadoNumeroDocumento: initialData.encargado?.numeroDocumento || '',
      });
      setLoadingComplete(true);
    }
  }, [initialData, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const hotelPayload = {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        paisId: data.paisId,
        provinciaId: data.provinciaId,
        ciudadId: data.ciudadId,
        categoriaId: data.categoriaId,
      };

      await axiosInstance.put(`/hotel/${hotelId}`, hotelPayload);
      toast.success('Ajustes generales actualizados exitosamente');

      // Note: we are currently omitting the 'encargado update' logic
      // since the backend only supports inserting it on creation or requires a specific endpoint.
      // For now, the PUT /hotel/:id updates only the core hotel fields (name, phone, loc, etc).

      if (onUpdate) {
        onUpdate();
      }

      // Reset isDirty state by resetting with current form values
      reset({}, { keepValues: true });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || 'Error al actualizar el hotel'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loadingComplete || loadingResources) {
    return <InnerLoading message="Cargando ajustes..." />;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ajustes Generales
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modifique la información base, contacto y ubicación física del hotel.
        </p>
      </div>

      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'general'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Información Básica
        </button>
        <button
          onClick={() => setActiveSubTab('ubicacion')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'ubicacion'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Ubicación Geográfica
        </button>
        <button
          onClick={() => setActiveSubTab('encargado')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'encargado'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <User className="h-4 w-4" />
          Encargado Actual
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Sección: Información Básica */}
        {activeSubTab === 'general' && (
        <div className="animate-in fade-in duration-300 rounded-xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
              Información Básica
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Hotel *
              </label>
              <input
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                })}
                className="w-full rounded-md border px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Ej: Hotel Paradise Resort"
              />
              {errors.nombre && (
                <span className="text-xs text-red-500">
                  {errors.nombre.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoría *
              </label>
              <select
                {...register('categoriaId', {
                  required: 'Seleccione una categoría',
                })}
                className="w-full rounded-md border px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Seleccionar...</option>
                {categorias?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && (
                <span className="text-xs text-red-500">
                  {errors.categoriaId.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono *
              </label>
              <input
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                })}
                className="w-full rounded-md border px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="+54 ..."
              />
              {errors.telefono && (
                <span className="text-xs text-red-500">
                  {errors.telefono.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { required: 'El email es obligatorio' })}
                className="w-full rounded-md border px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="hotel@ejemplo.com"
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting
                  ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Información Básica'}
            </button>
          </div>
        </div>
        )}

        {/* Sección: Ubicación */}
        {activeSubTab === 'ubicacion' && (
        <div className="animate-in fade-in duration-300 rounded-xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
              Ubicación Geográfica
            </h3>
          </div>
          <div className="space-y-4">
            <div className="max-w-2xl space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección *
              </label>
              <input
                {...register('direccion', {
                  required: 'La dirección es obligatoria',
                })}
                className="w-full rounded-md border px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Calle, Número, Piso..."
              />
              {errors.direccion && (
                <span className="text-xs text-red-500">
                  {errors.direccion.message}
                </span>
              )}
            </div>

            <UbicacionSelector
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </div>
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting
                  ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar Ubicación'}
            </button>
          </div>
        </div>
        )}

        {/* Sección: Encargado Actual (Solo Lectura por ahora) */}
        {activeSubTab === 'encargado' && (
        <div className="animate-in fade-in duration-300 cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50/50 p-6 opacity-80 dark:border-gray-700/50 dark:bg-gray-800/50">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                Datos del Encargado (Lectura)
              </h3>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Próximamente Editable
            </span>
          </div>

          <div className="pointer-events-none">
            <EncargadoForm
              register={register}
              errors={errors}
              loading={false}
            />
          </div>
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
             <p className="text-xs text-gray-400 italic">La edición del encargado estará habilitada en una fase posterior.</p>
          </div>
        </div>
        )}

      </form>
    </div>
  );
}
