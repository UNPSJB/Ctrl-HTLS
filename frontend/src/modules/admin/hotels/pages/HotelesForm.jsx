import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, User, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@admin-hooks/useHotel';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';

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

// Formulario para creación y edición básica de hoteles
export default function HotelesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCrumbLabel } = useBreadcrumbs();
  const isEditing = Boolean(id);
  const { categorias, loading: loadingResources } = useHotel();

  const [activeTab, setActiveTab] = useState('general');
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);
  const [initialEncargadoId, setInitialEncargadoId] = useState(null);

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
      tiposHabitaciones: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
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
        setCrumbLabel(id, hotel.nombre);
      }

      reset({
        nombre: hotel.nombre || '',
        direccion: hotel.direccion || '',
        telefono: hotel.telefono || '',
        email: hotel.email || '',
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
    setIsSubmitting(true);
    try {
      const encargadoIdParaHotel = selectedEncargadoId;

      const hotelPayload = {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
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
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderGeneralTab = () => (
    <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-300 md:grid-cols-2">
      <FormField label="Nombre del Hotel" required error={errors.nombre}>
        <TextInput
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          placeholder="Ej: Hotel Paradise Resort"
        />
      </FormField>

      <FormField label="Categoría" required error={errors.categoriaId}>
        <SelectInput
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

      <FormField label="Teléfono" required error={errors.telefono}>
        <TelInput
          {...register('telefono', { required: 'El teléfono es obligatorio' })}
          placeholder="Ej: +54 376 4123456"
        />
      </FormField>

      <FormField label="Email" required error={errors.email}>
        <EmailInput
          {...register('email', { required: 'El email es obligatorio' })}
          placeholder="hotel@ejemplo.com"
        />
      </FormField>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado del Hotel */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => navigate('/admin/hoteles')}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registrar Nuevo Hotel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete la información para dar de alta un hotel
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navegación por Pestañas */}
        <aside className="w-full lg:w-80 shrink-0">
          <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {[
              { id: 'general', icon: Building2, label: 'General' },
              { id: 'ubicacion', icon: MapPin, label: 'Ubicación' },
              { id: 'encargado', icon: User, label: 'Encargado' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido de la Pestaña Activa */}
        <main className="flex-1 w-full min-w-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-6"
          >
            {/* Cuerpo del Formulario */}
            <div className="flex-1">
              {loadingResources || loadingData ? (
                <div className="flex-1 flex items-center justify-center">
                  <InnerLoading message="Preparando formulario de hotel..." />
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  {activeTab === 'general' && renderGeneralTab()}

                  {activeTab === 'ubicacion' && (
                    <div className="animate-in fade-in space-y-6 duration-300">
                      <FormField label="Dirección" required error={errors.direccion}>
                        <TextInput
                          {...register('direccion', {
                            required: 'La dirección es obligatoria',
                          })}
                          placeholder="Ej: Av. Principal 123"
                        />
                      </FormField>
                      <UbicacionSelector
                        errors={errors}
                        register={register}
                        setValue={setValue}
                        watch={watch}
                      />
                    </div>
                  )}

                  {activeTab === 'encargado' && (
                    <div className="animate-in fade-in space-y-4 duration-300 flex flex-col h-full">
                      <EncargadosList
                        value={selectedEncargadoId}
                        onChange={setSelectedEncargadoId}
                        exclude={initialEncargadoId}
                      />
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
                        <User className="h-5 w-5 text-blue-500" />
                        <p>
                          ¿El encargado que buscas no aparece o no está registrado?{' '}
                          <a
                            href="/admin/encargados/nuevo"
                            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Hacé clic acá para gestionarlos
                          </a>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Estático */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
               <RedirectLink
                to="/admin/hoteles"
                label="Cancelar"
                icon={X}
                className="px-5 py-2.5"
              />
              <button
                type="submit"
                disabled={isSubmitting || loadingResources || loadingData}
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
                    Guardar Hotel
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

