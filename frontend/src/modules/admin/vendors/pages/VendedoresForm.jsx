import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, X, Lock, MapPin, Building2, Briefcase, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import { 
    FormField, 
    TextInput, 
    EmailInput, 
    TelInput, 
    SelectInput,
    PasswordInput,
    RedirectLink
} from '@form';

const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'le', nombre: 'LE' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
];

const VendedoresForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCrumbLabel } = useBreadcrumbs();
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      tipoDocumento: 'dni',
      numeroDocumento: '',
      direccion: '',
      password: '',
      rol: 'vendedor',
      paisId: '',
      provinciaId: '',
      ciudadId: '',
    },
    mode: 'onChange'
  });



  const [assignedHotels, setAssignedHotels] = useState([]);
  const [initialHotels, setInitialHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tipoDocumento = watch('tipoDocumento');
  const rol = watch('rol');

  useEffect(() => {
    if (isEditing) {
      fetchVendedor();
    }
  }, [id]);

  const fetchVendedor = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      const data = response.data;

      if (data.nombre) {
        setCrumbLabel(id, `${data.nombre} ${data.apellido || ''}`.trim());
      }

      const userHotels = data.hotelesPermitidos ? data.hotelesPermitidos : [];

      reset({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        email: data.email || '',
        telefono: data.telefono || '',
        tipoDocumento: data.tipoDocumento || 'dni',
        numeroDocumento: data.numeroDocumento || '',
        direccion: data.direccion || '',
        password: '',
        rol: data.rol || 'vendedor',
      });

      setAssignedHotels(userHotels);
      setInitialHotels(userHotels);

      if (data.ubicacion) {
        setValue('paisId', data.ubicacion.paisId);
        setValue('provinciaId', data.ubicacion.provinciaId);
        setValue('ciudadId', data.ubicacion.ciudadId);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/personal/vendedores');
    } finally {
      setLoadingData(false);
    }
  };

  const handleRemoveHotel = (hotelId) => {
    if (window.confirm('¿Seguro que desea quitar el acceso a este hotel? Esta acción se aplicará al guardar.')) {
      setAssignedHotels(prev => prev.filter(h => h.id !== hotelId));
    }
  };

  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    let procesado = value.replace(tipoDocumento === 'pasaporte' ? /[^a-zA-Z0-9]/g : /\D/g, '');
    if (tipoDocumento === 'pasaporte') procesado = procesado.toUpperCase();
    setValue('numeroDocumento', procesado);
  };

  const handleNumericChange = (e) => {
    const { value } = e.target;
    setValue(e.target.name, value.replace(/\D/g, ''));
  };

  const handleTipoChange = (e) => {
    setValue('tipoDocumento', e.target.value);
    setValue('numeroDocumento', '');
  };

  const handlePaisChange = (val) => {
    originalHandlePaisChange(val);
  };

  const handleProvinciaChange = (val) => {
    originalHandleProvinciaChange(val);
  };

  const handleCiudadChange = (val) => {
    originalHandleCiudadChange(val);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing && !data.password) delete data.password;
      let vendedorId = id;

      if (isEditing) {
        await axiosInstance.put(`/empleado/${id}`, data);
        toast.success('Datos actualizados correctamente');
      } else {
        const res = await axiosInstance.post('/empleado', data);
        vendedorId = res.data.id;
        toast.success('Registro exitoso');
      }

      if (vendedorId && isEditing) {
        const currentIds = assignedHotels.map(h => h.id);
        const removedHotels = initialHotels.filter(h => !currentIds.includes(h.id));

        if (removedHotels.length > 0) {
          await Promise.all(removedHotels.map(h =>
            axiosInstance.post('/hotel/desasignar-empleado', { hotelId: h.id, vendedorId })
          ));
          toast.success('Permisos de hoteles actualizados');
        }
      }

      navigate('/admin/personal/vendedores');
    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.error || 'Error al guardar los datos';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin/personal/vendedores');


  return (
    <div className="space-y-6">

      {/* Perfil del Vendedor / Encabezado */}
      <PageHeader
        title={isEditing ? `${watch('nombre')} ${watch('apellido')}` : 'Nuevo Vendedor'}
        description={isEditing ? 'Gestione el perfil y accesos del personal' : 'Complete la información para dar de alta un vendedor'}
        onBack={handleCancel}
        icon={Briefcase}
        loading={loadingData}
        extra={isEditing && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-gray-400">Rol:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {rol === 'administrador' ? 'Administrador' : 'Vendedor'}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Activo
            </span>
          </div>
        )}
      />

      <SidebarLayout
        sidebar={
          <PageSidebar
            tabs={[
              { id: 'general', icon: User, label: 'Información Personal' },
              { id: 'ubicacion', icon: MapPin, label: 'Ubicación y Contacto' },
              rol === 'vendedor' && { id: 'hoteles', icon: Building2, label: 'Acceso a Hoteles' },
              { id: 'seguridad', icon: Lock, label: 'Seguridad' },
            ].filter(Boolean)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        }
      >
        <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">


            {loadingData ? (
              <InnerLoading message="Cargando perfil..." />
            ) : (
              <div className="flex-1 space-y-6">
                {activeTab === 'general' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField label="Nombre" required error={errors.nombre}>
                        <TextInput
                          id="nombre"
                          {...register('nombre', { required: 'El nombre es obligatorio' })}
                        />
                      </FormField>
                      <FormField label="Apellido" required error={errors.apellido}>
                        <TextInput
                          id="apellido"
                          {...register('apellido', { required: 'El apellido es obligatorio' })}
                        />
                      </FormField>
                      <FormField label="Tipo Documento" required error={errors.tipoDocumento}>
                        <SelectInput
                          id="tipoDocumento"
                          {...register('tipoDocumento', { onChange: handleTipoChange })}
                        >
                          {tiposDocumento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </SelectInput>
                      </FormField>
                      <FormField label="Número Documento" required error={errors.numeroDocumento}>
                        <TextInput
                          id="numeroDocumento"
                          {...register('numeroDocumento', {
                            required: 'El documento es obligatorio',
                            minLength: { value: 7, message: 'Mínimo 7 caracteres' },
                            onChange: handleDocumentoChange
                          })}
                          maxLength={15}
                        />
                      </FormField>
                      <FormField label="Rol en el Sistema" required error={errors.rol}>
                        <SelectInput
                          id="rol"
                          {...register('rol')}
                        >
                          <option value="vendedor">Vendedor</option>
                          <option value="administrador">Administrador</option>
                        </SelectInput>
                      </FormField>
                    </div>
                  </div>
                )}

                {activeTab === 'ubicacion' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación y Contacto</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField label="Email" required error={errors.email}>
                        <EmailInput
                          id="email"
                          {...register('email', {
                            required: 'El email es obligatorio',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido'
                            }
                          })}
                          placeholder="vendedor@empresa.com"
                        />
                      </FormField>
                      <FormField label="Teléfono" error={errors.telefono}>
                        <TelInput
                          id="telefono"
                          {...register('telefono', { onChange: handleNumericChange })}
                          placeholder="Ej: 3764556677"
                        />
                      </FormField>
                      <FormField label="Dirección" required error={errors.direccion} containerClassName="col-span-full">
                        <TextInput
                          id="direccion"
                          {...register('direccion', { required: 'La dirección es obligatoria' })}
                          placeholder="Calle, Número, Depto"
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
                )}

                {activeTab === 'hoteles' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hoteles Asignados</h3>
                    <p className="text-sm text-gray-500">
                      Gestione los hoteles a los que este vendedor tiene acceso.
                      <br />
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {assignedHotels.map((hotel) => (
                        <div
                          key={hotel.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-blue-900 dark:text-blue-300">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{hotel.nombre}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHotel(hotel.id)}
                            className="rounded-full p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
                            title="Quitar acceso"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {assignedHotels.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600">
                          <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                          <p>Este vendedor no tiene hoteles asignados.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'seguridad' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad de la Cuenta</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField 
                        label={isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'} 
                        required={!isEditing} 
                        error={errors.password}
                      >
                        <PasswordInput
                          id="password"
                          {...register('password', {
                            required: !isEditing ? 'La contraseña es obligatoria' : false,
                            minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                          })}
                        />
                      </FormField>
                      {isEditing && <p className="mt-1 text-xs text-gray-500 italic flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> Deje en blanco para mantener la contraseña actual.</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
               <RedirectLink
                to="/admin/usuarios"
                label="Cancelar"
                icon={X}
                className="px-5 py-2.5"
              />
              <button
                type="submit"
                disabled={loading || loadingData || !isValid}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Guardar Cambios' : `Registrar ${rol === 'administrador' ? 'Administrador' : 'Vendedor'}`}
                  </>
                )}
              </button>
            </div>

        </PageContentCard>
      </SidebarLayout>
    </div>
  );
};

export default VendedoresForm;
