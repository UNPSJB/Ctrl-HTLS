import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@admin-context/BreadcrumbContext';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

// Formulario para registro y edición de clientes
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

    const inputClass = (error) =>
        `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all`;

    const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
    const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

    return (
        <div className="space-y-6">
            {/* Encabezado Externo */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isEditing
                            ? 'Actualice los datos del cliente seleccionado'
                            : 'Ingrese los datos personales para dar de alta un cliente'}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                {loadingData ? (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <InnerLoading message="Cargando perfil del cliente..." />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
                        <div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                                        placeholder="Ej: Juan Carlos"
                                        className={inputClass(errors.nombre)}
                                    />
                                    {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Apellido <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('apellido', { required: 'El apellido es obligatorio' })}
                                        placeholder="Ej: García López"
                                        className={inputClass(errors.apellido)}
                                    />
                                    {errors.apellido && <p className={errorClass}>{errors.apellido.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Tipo de Documento <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('tipoDocumento', { onChange: handleTipoChange })}
                                        className={inputClass(errors.tipoDocumento)}
                                    >
                                        {tiposDocumento.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.tipoDocumento && <p className={errorClass}>{errors.tipoDocumento.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Número de Documento <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('numeroDocumento', {
                                            required: 'El documento es obligatorio',
                                            minLength: { value: 7, message: 'Mínimo 7 caracteres' },
                                            onChange: handleDocumentoChange
                                        })}
                                        placeholder={tipoDocumento === 'pasaporte' ? 'Ej: A1234567' : 'Ej: 12345678'}
                                        className={inputClass(errors.numeroDocumento)}
                                        maxLength={15}
                                    />
                                    {errors.numeroDocumento && <p className={errorClass}>{errors.numeroDocumento.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'El email es obligatorio',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email inválido'
                                            }
                                        })}
                                        placeholder="hotel@ejemplo.com"
                                        className={inputClass(errors.email)}
                                    />
                                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input
                                        type="text"
                                        {...register('telefono', { onChange: handleTelefonoChange })}
                                        placeholder="Ej: 3811234567"
                                        className={inputClass(errors.telefono)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading || !isValid}
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
                    </form>
                )}
            </div>
        </div>
    );
};

export default ClientesForm;
