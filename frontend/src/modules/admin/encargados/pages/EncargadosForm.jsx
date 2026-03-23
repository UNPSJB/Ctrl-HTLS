import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, UserCog, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    FormField, 
    TextInput, 
    SelectInput,
    TelInput,
    RedirectLink
} from '@form';

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
                        Registrar Nuevo Encargado
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        El encargado quedará disponible para ser asignado posteriormente a un hotel.
                    </p>
                </div>
            </div>

            {/* Contenedor del Formulario */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
                    <div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField label="Nombre" required error={errors.nombre}>
                                <TextInput
                                    placeholder="Ej: Juan Carlos"
                                    {...register('nombre', {
                                        required: 'El nombre es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                            </FormField>

                            <FormField label="Apellido" required error={errors.apellido}>
                                <TextInput
                                    placeholder="Ej: García López"
                                    {...register('apellido', {
                                        required: 'El apellido es obligatorio',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                                    })}
                                />
                            </FormField>

                            <FormField label="Tipo de Documento" required error={errors.tipoDocumento}>
                                <SelectInput
                                    {...register('tipoDocumento', {
                                        required: 'Seleccione un tipo'
                                    })}
                                    onChange={handleTipoChange}
                                >
                                    {tiposDocumento.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                    ))}
                                </SelectInput>
                            </FormField>

                            <FormField label="Número de Documento" required error={errors.numeroDocumento}>
                                <TextInput
                                    placeholder="Ej: 12345678"
                                    {...register('numeroDocumento', {
                                        required: 'El documento es obligatorio',
                                        minLength: { value: 7, message: 'Mínimo 7 caracteres' },
                                        maxLength: { value: 15, message: 'Documento muy largo' }
                                    })}
                                    onChange={handleDocumentoChange}
                                />
                            </FormField>

                            <FormField label="Teléfono" error={errors.telefono}>
                                <TelInput
                                    placeholder="Ej: 3811234567"
                                    {...register('telefono', {
                                        pattern: {
                                            value: /^[0-9]*$/,
                                            message: 'Solo se permiten números'
                                        }
                                    })}
                                    onChange={handleTelefonoChange}
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
                        <RedirectLink
                            to="/admin/encargados"
                            label="Cancelar"
                            icon={X}
                            className="px-5 py-2.5"
                        />

                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Registrar Encargado
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EncargadosForm;
