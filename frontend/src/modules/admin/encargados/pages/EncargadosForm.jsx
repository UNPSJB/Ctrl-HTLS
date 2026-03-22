import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, UserCog, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

const EncargadosForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form mode is always 'Create'
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid }
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

    const tipoDocumento = watch('tipoDocumento');

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
            await axiosInstance.post('/hotel/encargados', data);
            toast.success('Encargado registrado exitosamente');
            navigate('/admin/encargados');
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.error || 'Error al crear encargado. Verifique si el documento ya existe.';
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/admin/encargados');

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
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Registrar Nuevo Encargado
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        El encargado quedará disponible para ser asignado posteriormente a un hotel.
                    </p>
                </div>
            </div>

            {/* Contenedor del Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Columna Principal - Datos Personales */}
                    <div className="lg:col-span-2 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-100 pb-4 dark:border-gray-700 flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Carlos"
                                    className={inputClass(errors.nombre)}
                                    {...register('nombre', {
                                        required: 'El nombre es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                                {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: García López"
                                    className={inputClass(errors.apellido)}
                                    {...register('apellido', {
                                        required: 'El apellido es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                                {errors.apellido && <p className={errorClass}>{errors.apellido.message}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Tipo de Documento <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className={inputClass(errors.tipoDocumento)}
                                    {...register('tipoDocumento', {
                                        required: 'Seleccione un tipo'
                                    })}
                                    onChange={handleTipoChange}
                                >
                                    {tiposDocumento.map(tipo => (
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
                                    placeholder="Ej: 12345678"
                                    className={inputClass(errors.numeroDocumento)}
                                    {...register('numeroDocumento', {
                                        required: 'El documento es obligatorio',
                                        minLength: { value: 6, message: 'Documento muy corto' },
                                        maxLength: { value: 15, message: 'Documento muy largo' }
                                    })}
                                    onChange={handleDocumentoChange}
                                />
                                {errors.numeroDocumento && <p className={errorClass}>{errors.numeroDocumento.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Columna Secundaria - Info Adicional */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-100 pb-4 mb-4 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contacto</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej: 3811234567"
                                        className={inputClass(errors.telefono)}
                                        {...register('telefono', {
                                            pattern: {
                                                value: /^[0-9]*$/,
                                                message: 'Solo se permiten números'
                                            }
                                        })}
                                        onChange={handleTelefonoChange}
                                    />
                                    {errors.telefono && <p className={errorClass}>{errors.telefono.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Caja de Acciones Rápidas */}
                        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <button
                                type="submit"
                                disabled={loading || !isValid}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Registrar Encargado
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EncargadosForm;
