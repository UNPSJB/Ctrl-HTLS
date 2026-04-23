import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, MapPin, User, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@admin-hooks/useHotel';
import { capitalizeFirst } from '@/utils/stringUtils';

import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import EncargadosList from '@/modules/admin/shared/components/selectors/EncargadosList';
import { InnerLoading } from '@/components/ui/InnerLoading';
import AppButton from '@/components/ui/AppButton';
import {
  FormField,
  TextInput,
  EmailInput,
  TelInput,
  SelectInput,
  RedirectLink,
  TextAreaInput
} from '@form';

export default function AjustesGeneralesTab({
  hotelId,
  initialData,
  onUpdate,
  isActive = false,
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
      descripcion: '',
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
        nombre: capitalizeFirst(initialData.nombre) || '',
        direccion: capitalizeFirst(initialData.direccion) || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        descripcion: initialData.descripcion || '',
        categoriaId: initialData.categoriaId || '',
        paisId: initialData.ubicacion?.paisId || '',
        provinciaId: initialData.ubicacion?.provinciaId || '',
        ciudadId: initialData.ubicacion?.ciudadId || '',
        encargadoNombre: capitalizeFirst(initialData.encargado?.nombre) || '',
        encargadoApellido: capitalizeFirst(initialData.encargado?.apellido) || '',
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
        descripcion: data.descripcion,
        paisId: data.paisId,
        provinciaId: data.provinciaId,
        ciudadId: data.ciudadId,
        categoriaId: data.categoriaId,
        // Incluir el encargado directamente desde el state
        encargadoId: selectedEncargadoId,
      };

      await axiosInstance.put(`/hotel/${hotelId}`, hotelPayload);
      toast.success('Ajustes generales actualizados exitosamente');

      if (onUpdate) {
        onUpdate();
      }

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
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex-shrink-0 mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Building2 className="h-5 w-5 text-blue-500" />
            Ajustes Generales
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Modifique la información base, contacto y ubicación física del hotel.
          </p>
        </div>
      </div>

      {/* Paleta de estilos activos por pestaña */}
      <div className="flex-shrink-0 mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
        {/* Contenedor de sub-pestañas con scroll si es necesario */}
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-6">
          {/* Sección: Información Básica */}
          <div className={activeSubTab === 'general' ? 'animate-in fade-in duration-300' : 'hidden'}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Nombre del Hotel" required error={errors.nombre}>
                <TextInput
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
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
                    minLength: { value: 7, message: 'Mínimo 7 dígitos' },
                    maxLength: { value: 20, message: 'Máximo 20 dígitos' },
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
            
            <div className="mt-6">
               <FormField label="Descripción Básica" error={errors.descripcion}>
                 <TextAreaInput
                   {...register('descripcion', {
                     maxLength: { value: 500, message: 'Máximo 500 caracteres' },
                   })}
                   placeholder="Escriba una descripción o información general del hotel..."
                   rows={4}
                   showCount
                   maxLength={500}
                 />
               </FormField>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div className={activeSubTab === 'ubicacion' ? 'animate-in fade-in duration-300' : 'hidden'}>
            <UbicacionSelector
              errors={errors}
              register={register}
              setValue={setValue}
              watch={watch}
              showAddress={true}
            />
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

        <div className="flex-shrink-0 mt-4 pt-4 flex justify-end border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent pb-1">
          <AppButton
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            loading={isSubmitting}
            icon={Save}
            className="px-8 py-3 shadow-lg shadow-blue-500/20"
          >
            Guardar Ajustes Generales
          </AppButton>
        </div>
      </form>
    </div>
  );
}
