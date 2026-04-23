import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, User, Save, X, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@admin-hooks/useHotel';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';

import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import EncargadosList from '@/modules/admin/shared/components/selectors/EncargadosList';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { 
  FormField, 
  TextInput, 
  EmailInput, 
  TelInput,
  SelectInput,
  RedirectLink,
  TextAreaInput
} from '@form';

// Formulario para creación y edición básica de hoteles
export default function HotelesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCrumbLabel } = useBreadcrumbs();
  const isEditing = Boolean(id);
  const { categorias, loading: loadingResources } = useHotel();

  const [activeTab, setActiveTab] = useState('general');
  const [loadingData, setLoadingData] = useState(false);

  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);
  const [initialEncargadoId, setInitialEncargadoId] = useState(null);

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
      tiposHabitaciones: [],
    },
    mode: 'onChange'
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = form;

  // Carga inicial de datos para edición
  useEffect(() => {
    if (isEditing) {
      fetchHotelData();
    }
  }, [id]);

  // Obtiene datos del hotel desde la API
  const fetchHotelData = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/hotel/${id}`);
      const hotel = response.data;

      if (hotel.nombre) {
        setCrumbLabel(id, capitalizeFirst(hotel.nombre));
      }

      reset({
        nombre: capitalizeFirst(hotel.nombre) || '',
        direccion: capitalizeFirst(hotel.direccion) || '',
        telefono: hotel.telefono || '',
        email: hotel.email || '',
        descripcion: hotel.descripcion || '',
        categoriaId: hotel.categoriaId || '',
        paisId: hotel.ubicacion?.paisId || '',
        provinciaId: hotel.ubicacion?.provinciaId || '',
        ciudadId: hotel.ubicacion?.ciudadId || '',
        encargadoNombre: hotel.encargado?.nombre || '',
        encargadoApellido: hotel.encargado?.apellido || '',
        encargadoTipoDocumento: hotel.encargado?.tipoDocumento || '',
        encargadoNumeroDocumento: hotel.encargado?.numeroDocumento || '',
        tiposHabitaciones:
          hotel.tarifas?.map((t) => ({
            id: t.tipoHabitacionId,
            nombre: t.tipoHabitacionNombre,
            precio: t.precio,
          })) || [],
      });

      if (hotel.encargado?.id) {
        setSelectedEncargadoId(hotel.encargado.id);
        setInitialEncargadoId(hotel.encargado.id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del hotel');
      navigate('/admin/hoteles');
    } finally {
      setLoadingData(false);
    }
  };

  // Procesa el envío del formulario
  const onSubmit = async (data) => {
    if (!selectedEncargadoId) {
      toast.error('Debe seleccionar un responsable para el hotel desde la pestaña de Encargado', { duration: 4000 });
      setActiveTab('encargado');
      return;
    }

    try {
      const encargadoIdParaHotel = selectedEncargadoId;

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
        encargadoId: encargadoIdParaHotel,
        tipoHabitaciones: [], // Mandamos el arreglo vacío en la creación rápida
      };

      if (isEditing) {
        await axiosInstance.put(`/hotel/${id}`, hotelPayload);
        toast.success('Hotel actualizado exitosamente');
        navigate('/admin/hoteles');
      } else {
        const createRes = await axiosInstance.post('/hotel', hotelPayload);
        toast.success('Hotel creado exitosamente');

        // Redirigir al dashboard para terminar de configurarlo (flujo unificado)
        const newId = createRes.data?.id || createRes.data?.hotelId;
        if (newId) {
          navigate(`/admin/hoteles/${newId}/dashboard`);
        } else {
          navigate('/admin/hoteles');
        }
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al guardar el hotel');
    }
  };


  const handleNumericChange = (e) => {
    const { value } = e.target;
    setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Encabezado del Hotel */}
      <div className="flex-shrink-0">
        <PageHeader
          title={isEditing ? 'Editar Hotel' : 'Registrar Nuevo Hotel'}
          description={isEditing ? 'Gestione la información básica y de contacto del hotel' : 'Complete la información para dar de alta un hotel'}
          backTo="/admin/hoteles"
          icon={Building2}
          loading={loadingResources || loadingData}
        />
      </div>

      <SidebarLayout
        sidebar={
          <PageSidebar
            tabs={[
              { id: 'general', icon: Building2, label: 'Información General' },
              { id: 'contacto', icon: Phone, label: 'Medios de Contacto' },
              { id: 'ubicacion', icon: MapPin, label: 'Ubicación Geográfica' },
              { id: 'encargado', icon: User, label: 'Encargado' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loadingResources || loadingData}
          />
        }
      >
        <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="">
          {loadingResources || loadingData ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <InnerLoading message="Preparando formulario de hotel..." />
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {/* Información General */}
              <div className={activeTab === 'general' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información General</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField label="Nombre" required error={errors.nombre}>
                      <TextInput
                        id="nombre"
                        {...register('nombre', {
                          required: 'El nombre es obligatorio',
                          maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                        })}
                        placeholder="Ej: Hotel Paradise Resort"
                      />
                    </FormField>

                    <FormField label="Categoría" required error={errors.categoriaId}>
                      <SelectInput
                        id="categoriaId"
                        {...register('categoriaId', { required: 'Seleccione una categoría' })}
                      >
                        <option value="">Seleccionar...</option>
                        {categorias?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  </div>

                  <div className="mt-6">
                    <FormField label="Descripción del Hotel" error={errors.descripcion}>
                      <TextAreaInput
                        id="descripcion"
                        {...register('descripcion', {
                          maxLength: { value: 500, message: 'Máximo 500 caracteres' },
                        })}
                        placeholder="Escriba una descripción comercial que los clientes verán..."
                        rows={4}
                        showCount
                        maxLength={500}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Medios de Contacto */}
                <div className={activeTab === 'contacto' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medios de Contacto</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField label="Email" required error={errors.email}>
                      <EmailInput
                        id="email"
                        {...register('email', {
                          required: 'El email es obligatorio',
                          pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                        })}
                        placeholder="contacto@hotel.com"
                      />
                    </FormField>
                    <FormField label="Teléfono" error={errors.telefono}>
                      <TelInput
                        id="telefono"
                        {...register('telefono', {
                          onChange: handleNumericChange,
                          minLength: { value: 7, message: 'Mínimo 7 dígitos' },
                          maxLength: { value: 20, message: 'Máximo 20 dígitos' },
                        })}
                        placeholder="Ej: 3764556677"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Ubicación Geográfica */}
                <div className={activeTab === 'ubicacion' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación Geográfica</h3>
                  <div className="">
                    <UbicacionSelector
                      errors={errors}
                      register={register}
                      setValue={setValue}
                      watch={watch}
                      showAddress={true}
                    />
                  </div>
                </div>

                {/* Encargado */}
                <div className={activeTab === 'encargado' ? 'animate-in fade-in duration-300 flex flex-col' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Encargado del Hotel</h3>
                  <EncargadosList
                    value={selectedEncargadoId}
                    onChange={setSelectedEncargadoId}
                    exclude={initialEncargadoId}
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
          )}

          {/* Footer Estático */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white dark:bg-gray-800 pt-6 mt-6 dark:border-gray-700">
            <RedirectLink
              to="/admin/hoteles"
              label="Cancelar"
              className="px-5 py-2.5"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!isValid || isSubmitting || loadingResources || loadingData || !selectedEncargadoId}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Actualizar Hotel' : 'Guardar Hotel'}
                </>
              )}
            </button>
          </div>
        </PageContentCard>
      </SidebarLayout>
    </div>
  );
}

