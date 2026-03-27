import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, X, Users, User, Phone, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
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
                setCrumbLabel(id, `${data.nombre} ${data.apellido || ''}`.trim());
            }

            reset({
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                email: data.email || '',
                telefono: data.telefono || '',
                tipoDocumento: data.tipoDocumento || 'dni',
                numeroDocumento: data.numeroDocumento || '',
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

    const handleTipoChange = (e) => {
        const { value } = e.target;
        setValue('tipoDocumento', value);
        setValue('numeroDocumento', ''); // Limpiar documento al cambiar tipo
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
        <div className="space-y-6">
            {/* Perfil del Cliente / Encabezado */}
            <PageHeader
                title={isEditing ? `${watch('nombre')} ${watch('apellido')}` : 'Nuevo Cliente'}
                description={isEditing ? 'Gestión de información personal y contacto' : 'Complete el formulario para dar de alta un cliente'}
                onBack={handleCancel}
                icon={Users}
                loading={loadingData}
            />

            <SidebarLayout
                sidebar={
                    <PageSidebar
                        tabs={[
                            { id: 'personal', icon: User, label: 'Información Personal' },
                            { id: 'contacto', icon: Phone, label: 'Contacto y Otros' },
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                }
            >
                <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {loadingData ? (
                        <InnerLoading message="Cargando perfil del cliente..." />
                    ) : (
                        <div className="flex-1 space-y-6">
                            {activeTab === 'personal' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField label="Nombre" required error={errors.nombre}>
                                            <TextInput
                                                {...register('nombre', { required: 'El nombre es obligatorio' })}
                                                placeholder="Ej: Juan Carlos"
                                            />
                                        </FormField>

                                        <FormField label="Apellido" required error={errors.apellido}>
                                            <TextInput
                                                {...register('apellido', { required: 'El apellido es obligatorio' })}
                                                placeholder="Ej: García López"
                                            />
                                        </FormField>

                                        <FormField label="Tipo de Documento" required error={errors.tipoDocumento}>
                                            <SelectInput
                                                {...register('tipoDocumento', { onChange: handleTipoChange })}
                                            >
                                                {tiposDocumento.map((tipo) => (
                                                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                                ))}
                                            </SelectInput>
                                        </FormField>

                                        <FormField label="Número de Documento" required error={errors.numeroDocumento}>
                                            <TextInput
                                                {...register('numeroDocumento', {
                                                    required: 'El documento es obligatorio',
                                                    minLength: { value: 7, message: 'Mínimo 7 caracteres' },
                                                    onChange: handleDocumentoChange
                                                })}
                                                placeholder={tipoDocumento === 'pasaporte' ? 'Ej: A1234567' : 'Ej: 12345678'}
                                                maxLength={15}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contacto' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medios de Contacto</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField label="Email" required error={errors.email}>
                                            <EmailInput
                                                {...register('email', {
                                                    required: 'El email es obligatorio',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Email inválido'
                                                    }
                                                })}
                                                placeholder="hotel@ejemplo.com"
                                            />
                                        </FormField>

                                        <FormField label="Teléfono" error={errors.telefono}>
                                            <TelInput
                                                {...register('telefono', { onChange: handleTelefonoChange })}
                                                placeholder="Ej: 3811234567"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                        <RedirectLink
                            to="/admin/clientes"
                            label="Cancelar"
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
