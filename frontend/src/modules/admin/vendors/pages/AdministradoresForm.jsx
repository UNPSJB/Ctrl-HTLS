import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, Lock, MapPin, ShieldCheck, Phone } from 'lucide-react';
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
    RedirectLink
} from '@form';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

const AdministradoresForm = () => {
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
            rol: 'administrador',
            paisId: '',
            provinciaId: '',
            ciudadId: '',
        },
        mode: 'onChange'
    });



    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const tipoDocumento = watch('tipoDocumento');

    useEffect(() => {
        if (isEditing) {
            fetchAdmin();
        }
    }, [id]);

    const fetchAdmin = async () => {
        try {
            setLoadingData(true);
            // Usando el endpoint correcto para administradores
            const response = await axiosInstance.get(`/administrador/${id}`);
            const data = response.data;

            if (data.nombre) {
                setCrumbLabel(id, `${capitalizeFirst(data.nombre)} ${capitalizeFirst(data.apellido || '')}`.trim());
            }

            reset({
                nombre: capitalizeFirst(data.nombre) || '',
                apellido: capitalizeFirst(data.apellido) || '',
                email: data.email || '',
                telefono: data.telefono || '',
                tipoDocumento: data.tipoDocumento || 'dni',
                numeroDocumento: data.numeroDocumento || '',
                direccion: capitalizeFirst(data.direccion) || '',
                password: '',
                rol: 'administrador',
                paisId: data.ubicacion?.paisId || '',
                provinciaId: data.ubicacion?.provinciaId || '',
                ciudadId: data.ubicacion?.ciudadId || '',
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del administrador');
            navigate('/admin/administradores');
        } finally {
            setLoadingData(false);
        }
    };

    const handleDocumentoChange = (e) => {
        const { value } = e.target;
        let procesado = value.replace(tipoDocumento === 'pasaporte' ? /[^a-zA-Z0-9]/g : /\D/g, '');
        if (tipoDocumento === 'pasaporte') procesado = procesado.toUpperCase();
        setValue('numeroDocumento', procesado);
    };

    const handleNumericChange = (e) => {
        setValue(e.target.name, e.target.value.replace(/\D/g, ''), { shouldValidate: true });
    };

    const handleTipoChange = (e) => {
        setValue('tipoDocumento', e.target.value, { shouldValidate: true });
        setValue('numeroDocumento', '', { shouldValidate: true });
    };



    const onSubmit = async (data) => {
        try {
            // Eliminar contraseña en modo edición
            if (isEditing) delete data.password;

            if (isEditing) {
                // Usar endpoint exclusivo de administradores para la actualización
                await axiosInstance.put(`/administrador/${id}`, data);
                toast.success('Administrador actualizado correctamente');
            } else {
                await axiosInstance.post('/empleado', data);
                toast.success('Administrador registrado correctamente');
            }
            navigate('/admin/administradores');
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.error || (isEditing ? 'Error al actualizar administrador' : 'Error al crear administrador');
            toast.error(mensaje);
        }
    };

    const handleCancel = () => navigate('/admin/administradores');


    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Encabezado del Administrador */}
            <div className="flex-shrink-0">
                <PageHeader
                    title={isEditing ? 'Editar Administrador' : 'Registrar Nuevo Administrador'}
                    description={isEditing ? 'Gestione la información de perfil y acceso del administrador' : 'Complete el formulario para dar de alta un administrador'}
                    backTo="/admin/administradores"
                    icon={ShieldCheck}
                    loading={loadingData}
                />
            </div>

            <SidebarLayout
                sidebar={
                    <PageSidebar
                        tabs={[
                            { id: 'personal', icon: User, label: 'Información Personal' },
                            { id: 'contacto', icon: Phone, label: 'Medios de Contacto' },
                            { id: 'ubicacion', icon: MapPin, label: 'Ubicación Geográfica' },
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
                            <InnerLoading message="Consultando privilegios..." />
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            {/* Información Personal */}
                            <div className={activeTab === 'personal' ? 'space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField label="Nombre" required error={errors.nombre}>
                                        <TextInput
                                            id="nombre"
                                            {...register('nombre', {
                                              required: 'El nombre es obligatorio',
                                              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                                            })}
                                            placeholder="Ej: Juan Carlos"
                                        />
                                    </FormField>
                                    <FormField label="Apellido" required error={errors.apellido}>
                                        <TextInput
                                            id="apellido"
                                            {...register('apellido', {
                                              required: 'El apellido es obligatorio',
                                              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                                            })}
                                            placeholder="Ej: García López"
                                        />
                                    </FormField>
                                    <FormField label="Tipo de Documento" required error={errors.tipoDocumento}>
                                        <SelectInput
                                            id="tipoDocumento"
                                            {...register('tipoDocumento', { onChange: handleTipoChange })}
                                        >
                                            {tiposDocumento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                        </SelectInput>
                                    </FormField>
                                    <FormField label="Número de Documento" required error={errors.numeroDocumento}>
                                        <TextInput
                                            id="numeroDocumento"
                                            {...register('numeroDocumento', {
                                                required: 'El documento es obligatorio',
                                                minLength: { value: 7, message: 'Mínimo 7 caracteres' },
                                                maxLength: { value: 15, message: 'Máximo 15 caracteres' },
                                                onChange: handleDocumentoChange
                                            })}
                                            maxLength={15}
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
                                                pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
                                            })}
                                            placeholder="admin@empresa.com"
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
                                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                                })}
                                                placeholder="••••••••"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white dark:bg-gray-800 pt-6 mt-6 dark:border-gray-700">
                        <RedirectLink
                            to="/admin/administradores"
                            label="Cancelar"
                            className="px-5 py-2.5"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
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
                                    {isEditing ? 'Actualizar Administrador' : 'Guardar Administrador'}
                                </>
                            )}
                        </button>
                    </div>
                </PageContentCard>
            </SidebarLayout>
        </div>
    );
};

export default AdministradoresForm;
