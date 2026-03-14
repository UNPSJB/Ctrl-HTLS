import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, User, Bed, DoorOpen, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@/hooks/useHotel';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import { Loading } from '@/components/ui/Loading';
import { InnerLoading } from '@/components/ui/InnerLoading';
import HabitacionesList from '@/modules/admin/hotels/components/HabitacionesList';

// Formulario para gestión de hoteles
export default function HotelesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCrumbLabel } = useBreadcrumbs();
  const isEditing = Boolean(id);
  const { tiposHabitaciones, categorias, loading: loadingResources } = useHotel();

  const [activeTab, setActiveTab] = useState('general');
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modo de selección de encargado: 'select' o 'create'
  const [encargadoMode, setEncargadoMode] = useState('create');
  const [encargadosExistentes, setEncargadosExistentes] = useState([]);
  const [selectedEncargadoId, setSelectedEncargadoId] = useState(null);

  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioTemporal, setPrecioTemporal] = useState('');

  const [localRooms, setLocalRooms] = useState([]);

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
    setError,
    clearErrors,
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
        tiposHabitaciones: hotel.tarifas?.map(t => ({
          id: t.tipoHabitacionId,
          nombre: t.tipoHabitacionNombre,
          precio: t.precio
        })) || [],
      });

      if (hotel.encargado?.id) {
        setSelectedEncargadoId(hotel.encargado.id);
        setEncargadoMode('create'); // Por defecto para ver sus datos
      }

      if (hotel.tarifas) {
        const formattedTarifas = hotel.tarifas.map(t => ({
          id: t.tipoHabitacionId,
          nombre: t.tipoHabitacionNombre,
          precio: t.precio
        }));
        setTiposSeleccionados(formattedTarifas);
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del hotel');
      navigate('/admin/hoteles');
    } finally {
      setLoadingData(false);
    }
  };

  // Agrega un tipo de habitación a la lista local
  const handleAgregarTipoHabitacion = () => {
    if (selectedTipo && precioTemporal && !isNaN(precioTemporal)) {
      const tipoId = Number.parseInt(selectedTipo);
      const tipoExiste = tiposSeleccionados.find((t) => t.id === tipoId);

      if (!tipoExiste) {
        const tipoCatalogo = tiposHabitaciones.find(t => t.id == tipoId);
        const nuevoTipo = {
          id: tipoId,
          nombre: tipoCatalogo?.nombre || 'Desconocido',
          precio: Number.parseFloat(precioTemporal),
        };

        const nuevosSeleccionados = [...tiposSeleccionados, nuevoTipo];
        setTiposSeleccionados(nuevosSeleccionados);
        setValue('tiposHabitaciones', nuevosSeleccionados);
        clearErrors('tiposHabitaciones');
        setSelectedTipo('');
        setPrecioTemporal('');
      } else {
        toast.error('Este tipo de habitación ya fue agregado');
      }
    }
  };

  const handleTipoHabitacionRemove = (tipoId) => {
    const nuevosSeleccionados = tiposSeleccionados.filter((t) => t.id !== tipoId);
    setTiposSeleccionados(nuevosSeleccionados);
    setValue('tiposHabitaciones', nuevosSeleccionados);

    if (nuevosSeleccionados.length === 0) {
      setError('tiposHabitaciones', {
        type: 'required',
        message: 'Debe agregar al menos un tipo de habitación',
      });
    }
  };

  // Procesa el envío del formulario
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (tiposSeleccionados.length === 0) {
        setError('tiposHabitaciones', { type: 'required', message: 'Debe agregar al menos un tipo de habitación' });
        toast.error('Falta inventario');
        setIsSubmitting(false);
        return;
      }

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
          const respEncargado = await axiosInstance.post('/hotel/encargados', encargadoData);
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
        tipoHabitaciones: tiposSeleccionados.map(t => ({ id: t.id, precio: t.precio })),
      };

      if (isEditing) {
        await axiosInstance.put(`/hotel/${id}`, hotelPayload);
        toast.success('Hotel actualizado exitosamente');
      } else {
        const res = await axiosInstance.post('/hotel', hotelPayload);
        const newHotelId = res.data.id;
        toast.success('Hotel creado exitosamente');

        if (localRooms.length > 0 && newHotelId) {
          try {
            const roomPromises = localRooms.map(room =>
              axiosInstance.post(`/hotel/${newHotelId}/habitacion`, {
                numero: room.numero,
                piso: room.piso,
                tipoHabitacionId: room.tipoHabitacionId
              }, { timeout: 30000 })
            );

            await Promise.all(roomPromises);
            toast.success(`${localRooms.length} habitaciones iniciales creadas`);
          } catch (roomErr) {
            console.error(roomErr);
            toast.error('Error al crear las habitaciones iniciales');
          }
        }
      }

      navigate('/admin/hoteles');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al guardar el hotel');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderGeneralTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Hotel *</label>
        <input
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="Ej: Hotel Paradise Resort"
        />
        {errors.nombre && <span className="text-red-500 text-xs">{errors.nombre.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría *</label>
        <select
          {...register('categoriaId', { required: 'Seleccione una categoría' })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="">Seleccionar...</option>
          {categorias?.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        {errors.categoriaId && <span className="text-red-500 text-xs">{errors.categoriaId.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</label>
        <input
          {...register('telefono', { required: 'El teléfono es obligatorio' })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="+54 ..."
        />
        {errors.telefono && <span className="text-red-500 text-xs">{errors.telefono.message}</span>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
        <input
          type="email"
          {...register('email', { required: 'El email es obligatorio' })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="hotel@ejemplo.com"
        />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado del Hotel */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button onClick={() => navigate('/admin/hoteles')} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Hotel' : 'Registrar Nuevo Hotel'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEditing ? 'Modifique los datos del hotel' : 'Complete la información para dar de alta un hotel'}
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
              { id: 'tarifas', icon: Bed, label: 'Tarifas' },
              { id: 'habitaciones', icon: DoorOpen, label: 'Habitaciones' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === item.id
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
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px] flex flex-col">

            {/* Cuerpo del Formulario */}
            <div className="flex-1">
              {(loadingResources || loadingData) ? (
                <InnerLoading />
              ) : (
                <div className="animate-in fade-in duration-300">
                  {activeTab === 'general' && renderGeneralTab()}

                  {activeTab === 'ubicacion' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección *</label>
                        <input
                          {...register('direccion', { required: 'La dirección es obligatoria' })}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.direccion && <span className="text-red-500 text-xs">{errors.direccion.message}</span>}
                      </div>
                      <UbicacionSelector errors={errors} register={register} setValue={setValue} watch={watch} />
                    </div>
                  )}

                  {activeTab === 'encargado' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Selector de Modo de Encargado */}
                      <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => setEncargadoMode('create')}
                          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${encargadoMode === 'create'
                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                          {isEditing ? 'Datos del Encargado' : 'Registrar Nuevo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEncargadoMode('select')}
                          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${encargadoMode === 'select'
                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                          Seleccionar Existente
                        </button>
                      </div>

                      {encargadoMode === 'create' ? (
                        <div className="space-y-4">
                          <EncargadoForm register={register} errors={errors} loading={loadingResources || isSubmitting} />
                          {isEditing && (
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md dark:bg-yellow-900/20 dark:text-yellow-200 flex items-start gap-3">
                              <div className="mt-0.5">⚠️</div>
                              <p>Actualmente solo puedes ver los datos del encargado asignado. La edición proactiva de sus datos estará disponible próximamente en el backend.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Selector de Encargados</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                Esta funcionalidad requiere un endpoint de listado en el backend. Por ahora, el encargado actual se mantiene vinculado.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tarifas' && (
                    <TiposHabitacionSelector
                      tiposHabitaciones={tiposHabitaciones}
                      tiposSeleccionados={tiposSeleccionados}
                      selectedTipo={selectedTipo}
                      setSelectedTipo={setSelectedTipo}
                      precioTemporal={precioTemporal}
                      setPrecioTemporal={setPrecioTemporal}
                      onAgregar={handleAgregarTipoHabitacion}
                      onRemover={handleTipoHabitacionRemove}
                      canAdd={selectedTipo && precioTemporal && !isNaN(precioTemporal)}
                      loading={loadingResources}
                      errors={errors}
                    />
                  )}

                  {activeTab === 'habitaciones' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg dark:bg-blue-900/20 dark:text-blue-200 text-sm">
                        Aquí puedes dar de alta las habitaciones físicas (ej: 101, 102) y su ubicación.
                        Asegúrate de configurar primero los precios en la pestaña "Tarifas".
                      </div>
                      <HabitacionesList
                        hotelId={id}
                        tiposDisponibles={tiposSeleccionados}
                        localRooms={localRooms}
                        onLocalChange={setLocalRooms}
                      />
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
              {(activeTab !== 'habitaciones' || !isEditing) && (
                <button
                  type="submit"
                  disabled={isSubmitting || loadingResources || loadingData}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isSubmitting ? 'Guardando...' : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Hotel
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
