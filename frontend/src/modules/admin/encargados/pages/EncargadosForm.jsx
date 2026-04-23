import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, UserCog, User, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, SidebarLayout, PageSidebar, PageContentCard } from '@admin-ui';
import {
    FormField,
    TextInput,
    SelectInput,
    TelInput,
} from '@form';
import AppButton from '@/components/ui/AppButton';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

const EncargadosForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
        reset
    } = useForm({
        defaultValues: {
            nombre: '',
            apellido: '',
            telefono: '',
            tipoDocumento: 'dni',
            numeroDocumento: '',
        },
        mode: 'onChange'
    });

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing) {
            fetchEncargadoData();
        }
    }, [id]);

    const fetchEncargadoData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/hotel/encargados/${id}`);
            reset({
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                telefono: data.telefono || '',
                tipoDocumento: data.tipoDocumento || 'dni',
                numeroDocumento: data.dni || '', // El backend devuelve 'dni' para el número
            });
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los datos del encargado');
            navigate('/admin/encargados');
        } finally {
            setLoading(false);
        }
    };

    const tipoDocumento = watch('tipoDocumento');

    // Formateadores automáticos con validación reactiva
    const handleDocumentoChange = (e) => {
        const { value } = e.target;
        let procesado = value;
        if (['dni', 'li', 'le'].includes(tipoDocumento)) {
            procesado = value.replace(/\D/g, '');
        } else {
            procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        }
        setValue('numeroDocumento', procesado, { shouldValidate: true });
    };

    const handleNumericChange = (e) => {
        const { value } = e.target;
        setValue(e.target.name, value.replace(/\D/g, ''), { shouldValidate: true });
    };

    const handleTipoChange = (e) => {
        setValue('tipoDocumento', e.target.value, { shouldValidate: true });
        setValue('numeroDocumento', '', { shouldValidate: true });
    };

    // Envío del formulario
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (isEditing) {
                await axiosInstance.put(`/hotel/encargados/${id}`, data);
                toast.success('Encargado actualizado exitosamente');
            } else {
                await axiosInstance.post('/hotel/encargados', data);
                toast.success('Encargado registrado exitosamente');
            }
            navigate('/admin/encargados');
        } catch (error) {
            console.error(error);
            const action = isEditing ? 'actualizar' : 'crear';
            const mensaje = error.response?.data?.error || `Error al ${action} encargado.`;
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/admin/encargados');

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Encabezado del Encargado */}
            <div className="flex-shrink-0">
                <PageHeader
                    title={isEditing ? 'Editar Encargado' : 'Registrar Nuevo Encargado'}
                    description={isEditing
                        ? `Modificando el perfil de ${watch('nombre')} ${watch('apellido')}.`
                        : 'Complete los datos para dar de alta a un nuevo encargado operativo.'
                    }
                    onBack={handleCancel}
                    icon={UserCog}
                    loading={loading}
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
                        loading={loading}
                    />
                }
            >
                <PageContentCard as="form" onSubmit={handleSubmit(onSubmit)} className="">
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
                                <FormField label="Teléfono" error={errors.telefono}>
                                    <TelInput
                                        id="telefono"
                                        {...register('telefono', { onChange: handleNumericChange })}
                                        placeholder="Ej: 3764556677"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white dark:bg-gray-800 pt-6 mt-6 dark:border-gray-700">
                        <AppButton
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </AppButton>

                        <AppButton
                            type="submit"
                            disabled={!isValid || loading}
                            loading={loading}
                            icon={Save}
                        >
                            {isEditing ? 'Actualizar Cambios' : 'Guardar Encargado'}
                        </AppButton>
                    </div>
                </PageContentCard>
            </SidebarLayout>
        </div>
    );
};

export default EncargadosForm;
