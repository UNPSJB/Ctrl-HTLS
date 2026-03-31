import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, X, Users, User, Phone, Search } from 'lucide-react';
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
    RedirectLink
} from '@form';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

// Formulario para registro y edición de clientes con Estilo Industrial
const ClientesForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setCrumbLabel } = useBreadcrumbs();
    const isEditing = Boolean(id);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            nombre: '',
            apellido: '',
            tipoDocumento: 'dni',
            numeroDocumento: '',
            email: '',
            telefono: '',
            direccion: '',
            paisId: '',
            provinciaId: '',
            ciudadId: '',
        },
        mode: 'onChange'
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const tipoDocumento = watch('tipoDocumento');

    useEffect(() => {
        if (isEditing) {
            fetchCliente();
        }
    }, [id]);

    // Obtiene datos del cliente para editar
    const fetchCliente = async () => {
        try {
            setLoadingData(true);
            const response = await axiosInstance.get(`/cliente/${id}`);
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
                paisId: data.paisId ? String(data.paisId) : '',
                provinciaId: data.provinciaId ? String(data.provinciaId) : '',
                ciudadId: data.ciudadId ? String(data.ciudadId) : '',
                direccion: capitalizeFirst(data.direccion) || '',
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del cliente');
            navigate('/admin/clientes');
        } finally {
            setLoadingData(false);
        }
    };

    // Formateadores automáticos
    const handleDocumentoChange = (e) => {
        const { value } = e.target;
        let procesado = value;
        if (['dni', 'li', 'le'].includes(tipoDocumento)) {
            procesado = value.replace(/\D/g, '');
        } else {
            procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        }
        setValue('numeroDocumento', procesado);
    };

    const handleTelefonoChange = (e) => {
        const { value } = e.target;
        setValue('telefono', value.replace(/\D/g, ''));
    };

    const handleNumericChange = (e) => {
        const { value } = e.target;
        setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
    };

    const handleTipoChange = (e) => {
        setValue('tipoDocumento', e.target.value, { shouldValidate: true });
        setValue('numeroDocumento', '', { shouldValidate: true }); // Limpiar documento al cambiar tipo
    };

    // Envío del formulario
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (isEditing) {
                await axiosInstance.put(`/cliente/${id}`, data);
                toast.success('Cliente actualizado exitosamente');
            } else {
                await axiosInstance.post('/cliente', data);
                toast.success('Cliente registrado exitosamente');
            }
            navigate('/admin/clientes');
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.error || (isEditing ? 'Error al actualizar cliente' : 'Error al crear cliente');
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/admin/clientes');


    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Perfil del Cliente / Encabezado */}
            <div className="flex-shrink-0">
                <PageHeader
                    title={isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                    description={isEditing ? 'Gestione la información personal y de contacto del cliente' : 'Complete el formulario para dar de alta un cliente'}
                    onBack={handleCancel}
                    icon={Users}
                    loading={loadingData}
                />
            </div>

            <SidebarLayout
                sidebar={
                    <PageSidebar
                        tabs={[
                            { id: 'personal', icon: User, label: 'Información Personal' },
                            { id: 'contacto', icon: Phone, label: 'Medios de Contacto' },
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        loading={loadingData}
                    />
                }
            >
                <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="">
                    {loadingData ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <InnerLoading message="Cargando perfil del cliente..." />
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
                                            {...register('nombre', { required: 'El nombre es obligatorio' })}
                                            placeholder="Ej: Juan Carlos"
                                        />
                                    </FormField>
                                    <FormField label="Apellido" required error={errors.apellido}>
                                        <TextInput
                                            id="apellido"
                                            {...register('apellido', { required: 'El apellido es obligatorio' })}
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
                                            placeholder="cliente@empresa.com"
                                        />
                                    </FormField>
                                    <FormField label="Teléfono" error={errors.telefono}>
                                        <TelInput
                                            id="telefono"
                                            {...register('telefono', { onChange: handleNumericChange })}
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
                                    required={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white dark:bg-gray-800 pt-6 mt-6 dark:border-gray-700">
                        <RedirectLink
                            to="/admin/clientes"
                            label="Cancelar"
                            className="px-5 py-2.5"
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={!isValid || loading}
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
                                    {isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'}
                                </>
                            )}
                        </button>
                    </div>
                </PageContentCard>
            </SidebarLayout>
        </div>
    );
};

export default ClientesForm;
