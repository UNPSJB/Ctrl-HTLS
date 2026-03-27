import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, MapPin, User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@admin-hooks/useHotel';

import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import EncargadosList from '@/modules/admin/shared/components/selectors/EncargadosList';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { 
  FormField, 
  TextInput, 
  EmailInput, 
  TelInput, 
  SelectInput,
  RedirectLink
} from '@form';

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
    mode: 'onChange'
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

  const handleNumericChange = (e) => {
    const { value } = e.target;
    setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
  };

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

      {/* Paleta de estilos activos por pestaña */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'general' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <Building2 className={`h-4 w-4 ${activeSubTab === 'general' ? 'text-blue-500' : ''}`} />
          Información Básica
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('ubicacion')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'ubicacion' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <MapPin className={`h-4 w-4 ${activeSubTab === 'ubicacion' ? 'text-indigo-500' : ''}`} />
          Ubicación Geográfica
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('encargado')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeSubTab === 'encargado' ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <User className={`h-4 w-4 ${activeSubTab === 'encargado' ? 'text-violet-500' : ''}`} />
          Encargado Actual
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="">
        {/* Contenedor de sub-pestañas con scroll si es necesario */}
        <div className="">
          {/* Sección: Información Básica */}
          <div className={activeSubTab === 'general' ? 'animate-in fade-in duration-300' : 'hidden'}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Nombre del Hotel" required error={errors.nombre}>
                <TextInput
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                  })}
                  placeholder="Ej: Hotel Paradise Resort"
                />
              </FormField>

              <FormField label="Categoría" required error={errors.categoriaId}>
                <SelectInput
                  {...register('categoriaId', {
                    required: 'Seleccione una categoría',
                  })}
                >
                  <option value="">Seleccionar...</option>
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Teléfono" required error={errors.telefono}>
                <TelInput
                  {...register('telefono', {
                    required: 'El teléfono es obligatorio',
                    onChange: handleNumericChange
                  })}
                  placeholder="Ej: 3764556677"
                />
              </FormField>

              <FormField label="Email" required error={errors.email}>
                <EmailInput
                  {...register('email', { 
                    required: 'El email es obligatorio',
                    pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                  })}
                  placeholder="contacto@hotel.com"
                />
              </FormField>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div className={activeSubTab === 'ubicacion' ? 'animate-in fade-in duration-300' : 'hidden'}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Dirección" required error={errors.direccion}>
                <TextInput
                  {...register('direccion', {
                    required: 'La dirección es obligatoria',
                  })}
                  placeholder="Calle, Número, Piso..."
                />
              </FormField>

              <UbicacionSelector
                errors={errors}
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </div>
          </div>

          {/* Sección: Encargado */}
          <div className={activeSubTab === 'encargado' ? 'animate-in fade-in duration-300 flex flex-col' : 'hidden'}>
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
          </div>
        </div>

        <div className="mt-10 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className={`flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting || !form.formState.isValid
                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando Cambios...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Ajustes Generales
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
