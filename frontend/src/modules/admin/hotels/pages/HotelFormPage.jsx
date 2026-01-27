import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Save, MapPin, User, Bed, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import useHotel from '@/hooks/useHotel';

// Components
import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import { Loading } from '@/components/ui/Loading';

export default function HotelFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { tiposHabitaciones, categorias, loading: loadingResources } = useHotel();

  // Local state for UI
  const [activeTab, setActiveTab] = useState('general');
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inventario state (managed manually as in useHotelForm)
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioTemporal, setPrecioTemporal] = useState('');

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

  // Fetch hotel data if editing
  useEffect(() => {
    if (isEditing) {
      fetchHotelData();
    }
  }, [id]);

  const fetchHotelData = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/hotel/${id}`);
      const hotel = response.data;

      // Populate form
      reset({
        nombre: hotel.nombre,
        direccion: hotel.direccion,
        telefono: hotel.telefono,
        email: hotel.email,
        categoriaId: hotel.categoriaId,
        paisId: hotel.ubicacion?.paisId || '',
        provinciaId: hotel.ubicacion?.provinciaId || '',
        ciudadId: hotel.ubicacion?.ciudadId || '',
        // Encargado data might be nested or separate. 
        // Assuming hotel.encargado is an object.
        encargadoNombre: hotel.encargado?.nombre || '',
        encargadoApellido: hotel.encargado?.apellido || '',
        encargadoTipoDocumento: hotel.encargado?.tipoDocumento || '',
        encargadoNumeroDocumento: hotel.encargado?.numeroDocumento || '',
        tiposHabitaciones: hotel.tiposHabitacion || [], // Assuming backend returns this
      });

      // Special handling for inventory state
      if (hotel.tiposHabitacion) {
        setTiposSeleccionados(hotel.tiposHabitacion.map(t => ({
           id: t.tipoHabitacionId || t.id, // Adjust based on backend response
           precio: t.precio,
           // Keep original objects if needed
           ...t 
        })));
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del hotel');
      navigate('/admin/hoteles');
    } finally {
      setLoadingData(false);
    }
  };

  // Inventory handlers
  const handleAgregarTipoHabitacion = () => {
    if (selectedTipo && precioTemporal && !isNaN(precioTemporal)) {
      const tipoId = Number.parseInt(selectedTipo);
      const tipoExiste = tiposSeleccionados.find((t) => t.id === tipoId);

      if (!tipoExiste) {
        const nuevoTipo = {
          id: tipoId,
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

  // Submit Handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (tiposSeleccionados.length === 0) {
        setError('tiposHabitaciones', { type: 'required', message: 'Debe agregar al menos un tipo de habitación' });
        toast.error('Falta inventario');
        setIsSubmitting(false);
        return;
      }

      let encargadoId = null;

      // Handle Encargado Creation/Update logic
      // TODO: Improve this to support editing existing encargado if needed
      // For now, we follow the creation flow or update hotel
      
      if (!isEditing) {
         // Create Encargado first
         const encargadoData = {
           nombre: data.encargadoNombre,
           apellido: data.encargadoApellido,
           tipoDocumento: data.encargadoTipoDocumento,
           numeroDocumento: data.encargadoNumeroDocumento,
         };
         
         try {
            const respEncargado = await axiosInstance.post('/hotel/encargados', encargadoData);
            encargadoId = respEncargado.data.id;
         } catch (err) {
            console.error(err);
             toast.error('Error al registrar encargado. Verifique los datos.');
             setIsSubmitting(false);
             return;
         }
      }

      // Prepare Hotel Payload
      const hotelPayload = {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        paisId: data.paisId,
        provinciaId: data.provinciaId,
        ciudadId: data.ciudadId,
        categoriaId: data.categoriaId,
        // Only send encargadoId if we created one or if we want to change it.
        // If editing and no new encargado, the backend keeps the old one?
        // Or we might need to send the existing one.
        ...(encargadoId && { encargadoId }),
        tipoHabitaciones: tiposSeleccionados.map(t => ({ id: t.id, precio: t.precio })),
      };

      if (isEditing) {
        await axiosInstance.put(`/hotel/${id}`, hotelPayload);
        toast.success('Hotel actualizado exitosamente');
      } else {
        await axiosInstance.post('/hotel', hotelPayload);
        toast.success('Hotel creado exitosamente');
      }

      navigate('/admin/hoteles');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al guardar el hotel');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingResources || loadingData) return <Loading />;

  // Form Sections
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
       {/* Header */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button onClick={() => navigate('/admin/hoteles')} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
           <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Building2 className="h-6 w-6" />
        </div>
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
         {/* Navigation Sidebar */}
         <aside className="lg:col-span-1">
            <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {[
                { id: 'general', icon: Building2, label: 'General' },
                { id: 'ubicacion', icon: MapPin, label: 'Ubicación' },
                { id: 'encargado', icon: User, label: 'Encargado' },
                { id: 'inventario', icon: Bed, label: 'Inventario' },
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

         {/* Form Content */}
         <main className="lg:col-span-3">
             <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px]">
                
                {activeTab === 'general' && renderGeneralTab()}
                
                {activeTab === 'ubicacion' && (
                  <div className="animate-in fade-in duration-300">
                     <div className="space-y-2 mb-4">
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
                   <div className="animate-in fade-in duration-300">
                      <EncargadoForm register={register} errors={errors} loading={loadingResources || isSubmitting} />
                      {isEditing && (
                        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md dark:bg-yellow-900/20 dark:text-yellow-200">
                          Nota: La edición de datos sensibles del encargado puede estar restringida.
                        </div>
                      )}
                   </div>
                )}

                {activeTab === 'inventario' && (
                  <div className="animate-in fade-in duration-300">
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
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                   <button
                     type="button"
                     onClick={() => navigate('/admin/hoteles')}
                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                   >
                     Cancelar
                   </button>
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Save className="h-4 w-4" />
                     {isSubmitting ? 'Guardando...' : 'Guardar Hotel'}
                   </button>
                </div>
             </form>
         </main>
      </div>
    </div>
  );
}
