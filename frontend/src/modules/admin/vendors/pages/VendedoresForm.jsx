import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, X, Lock, MapPin, Building2, Briefcase, Phone, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import { capitalizeFirst } from '@/utils/stringUtils';
import {
  FormField,
  TextInput,
  EmailInput,
  TelInput,
  SelectInput,
  PasswordInput,
} from '@form';
import AppButton from '@/components/ui/AppButton';
import { RULES, LIMITS } from '@/utils/validationRules';
import { TIPOS_DOCUMENTO } from '@/utils/constants';

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
    formState: { errors, isValid, isSubmitting }
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
        setCrumbLabel(id, `${capitalizeFirst(data.nombre)} ${capitalizeFirst(data.apellido || '')}`.trim());
      }

      const userHotels = data.hotelesPermitidos ? data.hotelesPermitidos : [];

      reset({
        nombre: capitalizeFirst(data.nombre) || '',
        apellido: capitalizeFirst(data.apellido) || '',
        email: data.email || '',
        telefono: data.telefono || '',
        tipoDocumento: data.tipoDocumento || 'dni',
        numeroDocumento: data.numeroDocumento || '',
        direccion: capitalizeFirst(data.direccion) || '',
        password: '',
        rol: data.rol || 'vendedor',
        paisId: data.ubicacion?.paisId || '',
        provinciaId: data.ubicacion?.provinciaId || '',
        ciudadId: data.ubicacion?.ciudadId || '',
      });

      setAssignedHotels(userHotels);
      setInitialHotels(userHotels);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/vendedores');
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
    setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
  };

  const handleTipoChange = (e) => {
    setValue('tipoDocumento', e.target.value, { shouldValidate: true });
  };

  const handlePaisChange = (val) => {
    // originalHandlePaisChange(val); // This function is not defined in the original code. Removing.
  };

  const handleProvinciaChange = (val) => {
    // originalHandleProvinciaChange(val); // This function is not defined in the original code. Removing.
  };

  const handleCiudadChange = (val) => {
    // originalHandleCiudadChange(val); // This function is not defined in the original code. Removing.
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) delete data.password;
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

      navigate('/admin/vendedores');
    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.error || 'Error al guardar los datos';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin/vendedores');


  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Encabezado del Vendedor */}
      <div className="flex-shrink-0">
        <PageHeader
          title={isEditing ? 'Editar Vendedor' : 'Registrar Nuevo Vendedor'}
          description={isEditing ? 'Gestione la información personal y permisos del vendedor' : 'Complete el formulario para dar de alta un vendedor'}
          backTo="/admin/vendedores"
          icon={Briefcase}
          loading={loadingData}
        />
      </div>

      <SidebarLayout
        sidebar={
          <PageSidebar
            tabs={[
              { id: 'general', icon: User, label: 'Información General' },
              { id: 'contacto', icon: Phone, label: 'Medios de Contacto' },
              { id: 'ubicacion', icon: MapPin, label: 'Ubicación' },
              (rol === 'vendedor' && isEditing) && { id: 'hoteles', icon: Building2, label: 'Hoteles Permitidos' },
              (!isEditing) && { id: 'seguridad', icon: Lock, label: 'Seguridad de la Cuenta' },
            ].filter(Boolean)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loadingData}
          />
        }
      >
        <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="">
          {loadingData ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <InnerLoading message="Cargando perfil..." />
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {/* Información Personal */}
              <div className={activeTab === 'general' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField label="Nombre" required error={errors.nombre}>
                    <TextInput
                      id="nombre"
                      {...register('nombre', {
                        required: 'El nombre es obligatorio',
                        ...RULES.nombre,
                      })}
                      placeholder="Ej: Juan Carlos"
                    />
                  </FormField>
                  <FormField label="Apellido" required error={errors.apellido}>
                    <TextInput
                      id="apellido"
                      {...register('apellido', {
                        required: 'El apellido es obligatorio',
                        ...RULES.apellido,
                      })}
                      placeholder="Ej: García López"
                    />
                  </FormField>
                  <FormField label="Tipo de Documento" required error={errors.tipoDocumento}>
                    <SelectInput
                      id="tipoDocumento"
                      {...register('tipoDocumento', { onChange: handleTipoChange })}
                    >
                      {TIPOS_DOCUMENTO.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Número de Documento" required error={errors.numeroDocumento}>
                    <TextInput
                      id="numeroDocumento"
                      {...register('numeroDocumento', {
                        required: 'El documento es obligatorio',
                        ...RULES.documento,
                        onChange: handleDocumentoChange
                      })}
                      maxLength={LIMITS.documento.max}
                      placeholder="Sin puntos ni guiones"
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
                        ...RULES.email,
                      })}
                      placeholder="vendedor@empresa.com"
                    />
                  </FormField>
                  <FormField label="Teléfono" error={errors.telefono}>
                    <TelInput
                      id="telefono"
                      {...register('telefono', {
                        onChange: handleNumericChange,
                        ...RULES.telefono,
                      })}
                      placeholder="Ej: 3764556677"
                    />
                  </FormField>
                </div>
              </div>

              {/* Ubicación Geográfica */}
              <div className={activeTab === 'ubicacion' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación Geográfica</h3>
                <UbicacionSelector
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  showAddress={true}
                />
              </div>

              {/* Seguridad de la Cuenta */}
              {(!isEditing) && (
                <div className={activeTab === 'seguridad' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad de la Cuenta</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      label="Contraseña"
                      required={true}
                      error={errors.password}
                    >
                      <PasswordInput
                        id="password"
                        {...register('password', {
                          required: 'La contraseña es obligatoria',
                          ...RULES.passwordCreacion,
                        })}
                        placeholder="••••••••"
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Acceso a Hoteles (Solo para Vendedores en Edición) */}
              {rol === 'vendedor' && isEditing && (
                <div className={activeTab === 'hoteles' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acceso a Hoteles</h3>
                  
                  <div className="relative flex flex-col min-h-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-4">
                              Hotel
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {assignedHotels.length > 0 ? (
                            assignedHotels.map((hotel) => (
                              <tr key={hotel.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                <td className="whitespace-nowrap px-6 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                      <Building2 className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {capitalizeFirst(hotel.nombre)}
                                    </span>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHotel(hotel.id)}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    title="Quitar acceso"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center gap-2 italic">
                                  <Building2 className="h-8 w-8 opacity-20" />
                                  <p>Este vendedor no tiene hoteles asignados.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white dark:bg-gray-800 pt-6 mt-6 dark:border-gray-700">
            <AppButton
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </AppButton>
            <AppButton
              type="submit"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
              icon={Save}
            >
              {isEditing ? 'Actualizar Vendedor' : 'Guardar Vendedor'}
            </AppButton>
          </div>
        </PageContentCard>
      </SidebarLayout>
    </div>
  );
};

export default VendedoresForm;
