import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, User, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@/hooks/useHotel';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import { InnerLoading } from '@/components/ui/InnerLoading';

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

  // Modo de selección de encargado: 'select' o 'create'
  const [encargadoMode, setEncargadoMode] = useState('create');
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
        setEncargadoMode('create'); // Por defecto para ver sus datos
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
      let encargadoIdParaHotel = null;

      if (encargadoMode === 'select') {
        if (isEditing && !selectedEncargadoId) {
          toast.error('Debe seleccionar un encargado del listado');
          setIsSubmitting(false);
          return;
        }
        encargadoIdParaHotel = selectedEncargadoId;
      } else {
        // Modo 'create': Validar que al menos el nombre esté presente
        if (!data.encargadoNombre) {
          toast.error('Nombre del encargado es obligatorio');
          setIsSubmitting(false);
          return;
        }

        const encargadoData = {
          nombre: data.encargadoNombre,
          apellido: data.encargadoApellido,
          tipoDocumento: data.encargadoTipoDocumento,
          numeroDocumento: data.encargadoNumeroDocumento,
        };

        try {
          const respEncargado = await axiosInstance.post(
            '/hotel/encargados',
            encargadoData
          );
          encargadoIdParaHotel = respEncargado.data.id;
        } catch (err) {
          console.error(err);
          toast.error('Error al registrar encargado. Verifique los datos.');
          setIsSubmitting(false);
          return;
        }
      }

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
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre del Hotel *
        </label>
        <input
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Ej: Hotel Paradise Resort"
        />
        {errors.nombre && (
          <span className="text-xs text-red-500">{errors.nombre.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Categoría *
        </label>
        <select
          {...register('categoriaId', { required: 'Seleccione una categoría' })}
          className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
          {...register('telefono', { required: 'El teléfono es obligatorio' })}
          className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
          className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          placeholder="hotel@ejemplo.com"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navegación por Pestañas */}
        <aside className="lg:col-span-1">
          <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {[
              { id: 'general', icon: Building2, label: 'General' },
              { id: 'ubicacion', icon: MapPin, label: 'Ubicación' },
              { id: 'encargado', icon: User, label: 'Encargado' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido de la Pestaña Activa */}
        <main className="lg:col-span-3">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-[400px] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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
                    <div className="animate-in fade-in space-y-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dirección *
                        </label>
                        <input
                          {...register('direccion', {
                            required: 'La dirección es obligatoria',
                          })}
                          className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                  )}

                  {activeTab === 'encargado' && (
                    <div className="animate-in fade-in space-y-6 duration-300">
                      {/* Selector de Modo de Encargado */}
                      <div className="flex w-fit rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                        <button
                          type="button"
                          onClick={() => setEncargadoMode('create')}
                          className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                            encargadoMode === 'create'
                              ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                        >
                          {isEditing
                            ? 'Datos del Encargado'
                            : 'Registrar Nuevo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEncargadoMode('select')}
                          className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                            encargadoMode === 'select'
                              ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                        >
                          Seleccionar Existente
                        </button>
                      </div>

                      {encargadoMode === 'create' ? (
                        <div className="space-y-4">
                          <EncargadoForm
                            register={register}
                            errors={errors}
                            loading={loadingResources || isSubmitting}
                          />
                          {isEditing && (
                            <div className="flex items-start gap-3 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                              <div className="mt-0.5">⚠️</div>
                              <p>
                                Actualmente solo puedes ver los datos del
                                encargado asignado. La edición proactiva de sus
                                datos estará disponible próximamente en el
                                backend.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Selector de Encargados
                              </h4>
                              <p className="max-w-xs text-xs text-gray-500 dark:text-gray-400">
                                Esta funcionalidad requiere un endpoint de
                                listado en el backend. Por ahora, el encargado
                                actual se mantiene vinculado.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Estático */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/hoteles')}
                disabled={isSubmitting || loadingResources || loadingData}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loadingResources || loadingData}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSubmitting ? (
                  'Guardando...'
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

