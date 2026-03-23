import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, MapPin, User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@/hooks/useHotel';

import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import EncargadosList from '@/components/selectors/EncargadosList';
import { InnerLoading } from '@/components/ui/InnerLoading';
import RedirectLink from '@/components/ui/form/RedirectLink';

export default function AjustesGeneralesTab({
  hotelId,
  initialData,
  onUpdate,
}) {
  const { categorias, loading: loadingResources } = useHotel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);

  const inputClass = (error) =>
    `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all`;
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
  const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

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
      // Inicializar el encargado seleccionado con el actual del hotel
      if (initialData.encargado?.id) {
        setSelectedEncargadoId(initialData.encargado.id);
      }
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
        // Incluir el encargado directamente desde el state
        encargadoId: selectedEncargadoId,
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

      {/* Paleta de estilos activos por pestaña (strings completos para Tailwind) */}
      {(() => {
        const TAB_STYLES = {
          general:   { active: 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400', icon: 'text-blue-500' },
          ubicacion: { active: 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400', icon: 'text-indigo-500' },
          encargado: { active: 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400', icon: 'text-violet-500' },
        };
        const inactive = 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300';
        return (
          <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSubTab('general')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'general' ? TAB_STYLES.general.active : inactive}`}
            >
              <Building2 className={`h-4 w-4 ${activeSubTab === 'general' ? TAB_STYLES.general.icon : ''}`} />
              Información Básica
            </button>
            <button
              onClick={() => setActiveSubTab('ubicacion')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'ubicacion' ? TAB_STYLES.ubicacion.active : inactive}`}
            >
              <MapPin className={`h-4 w-4 ${activeSubTab === 'ubicacion' ? TAB_STYLES.ubicacion.icon : ''}`} />
              Ubicación Geográfica
            </button>
            <button
              onClick={() => setActiveSubTab('encargado')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'encargado' ? TAB_STYLES.encargado.active : inactive}`}
            >
              <User className={`h-4 w-4 ${activeSubTab === 'encargado' ? TAB_STYLES.encargado.icon : ''}`} />
              Encargado Actual
            </button>
          </div>
        );
      })()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Sección: Información Básica */}
        {activeSubTab === 'general' && (
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Nombre del Hotel <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                })}
                className={inputClass(errors.nombre)}
                placeholder="Ej: Hotel Paradise Resort"
              />
              {errors.nombre && (
                <p className={errorClass}>
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                {...register('categoriaId', {
                  required: 'Seleccione una categoría',
                })}
                className={inputClass(errors.categoriaId)}
              >
                <option value="">Seleccionar...</option>
                {categorias?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && (
                <p className={errorClass}>
                  {errors.categoriaId.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                })}
                className={inputClass(errors.telefono)}
                placeholder="+54 ..."
              />
              {errors.telefono && (
                <p className={errorClass}>
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', { required: 'El email es obligatorio' })}
                className={inputClass(errors.email)}
                placeholder="hotel@ejemplo.com"
              />
              {errors.email && (
                <p className={errorClass}>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end pt-4">
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
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                {...register('direccion', {
                  required: 'La dirección es obligatoria',
                })}
                className={inputClass(errors.direccion)}
                placeholder="Calle, Número, Piso..."
              />
              {errors.direccion && (
                <p className={errorClass}>
                  {errors.direccion.message}
                </p>
              )}
            </div>

            <UbicacionSelector
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
            />
          </div>
          <div className="mt-6 flex justify-end pt-4">
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

        {/* Sección: Encargado */}
        {activeSubTab === 'encargado' && (
        <div className="animate-in fade-in duration-300 flex flex-col h-full">
          <EncargadosList
            value={selectedEncargadoId}
            onChange={setSelectedEncargadoId}
            exclude={initialData?.encargado?.id}
          />
          
          <RedirectLink
            to="/admin/encargados/nuevo"
            text="¿El encargado que buscas no aparece o no está registrado?"
            label="Hacé clic acá para gestionarlos."
            newTab
            className="mt-4"
          />

          {selectedEncargadoId !== initialData?.encargado?.id && (
            <div className="mt-6 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
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
                {isSubmitting ? 'Guardando...' : 'Guardar Encargado'}
              </button>
            </div>
          )}
        </div>
        )}

      </form>
    </div>
  );
}
