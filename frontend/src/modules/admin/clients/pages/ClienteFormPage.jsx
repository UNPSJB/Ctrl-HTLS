import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Save, X, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

// Formulario para registro y edición de clientes
const ClienteFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setCrumbLabel } = useBreadcrumbs();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipoDocumento: 'dni',
        numeroDocumento: '',
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

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
            setFormData({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Formatea el número de documento según el tipo
    const handleDocumentoChange = (e) => {
        const { value } = e.target;
        const tipo = formData.tipoDocumento;
        let procesado = value;

        if (['dni', 'li', 'le'].includes(tipo)) {
            procesado = value.replace(/\D/g, '');
        } else {
            procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        }

        setFormData((prev) => ({
            ...prev,
            numeroDocumento: procesado,
        }));
    };

    const handleTelefonoChange = (e) => {
        const { value } = e.target;
        const numericValue = value.replace(/\D/g, '');
        setFormData((prev) => ({
            ...prev,
            telefono: numericValue,
        }));
    };

    const handleTipoChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            tipoDocumento: value,
            numeroDocumento: '',
        }));
    };

    // Valida y envía el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (
            !formData.nombre ||
            !formData.apellido ||
            !formData.numeroDocumento ||
            !formData.email
        ) {
            toast.error('Por favor complete todos los campos obligatorios');
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                await axiosInstance.put(`/cliente/${id}`, formData);
                toast.success('Cliente actualizado exitosamente');
            } else {
                await axiosInstance.post('/cliente', formData);
                toast.success('Cliente registrado exitosamente');
            }
            navigate('/admin/clientes');
        } catch (error) {
            console.error(error);
            const mensaje = isEditing
                ? (error.response?.data?.error || 'Error al actualizar cliente')
                : (error.response?.data?.error || 'Error al crear cliente');
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/clientes');
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all';

    const labelClass =
        'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* Encabezado Externo */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {isEditing ? (
                        <Edit className="h-6 w-6" />
                    ) : (
                        <UserPlus className="h-6 w-6" />
                    )}
                </div>
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px] flex flex-col">
                {loadingData ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <InnerLoading message="Cargando perfil del cliente..." />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="nombre" className={labelClass}>
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="apellido" className={labelClass}>
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        placeholder="Ej: Pérez"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tipoDocumento" className={labelClass}>
                                        Tipo de Documento *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="tipoDocumento"
                                            name="tipoDocumento"
                                            value={formData.tipoDocumento}
                                            onChange={handleTipoChange}
                                            className={`${inputClass} appearance-none`}
                                        >
                                            {tiposDocumento.map((tipo) => (
                                                <option key={tipo.id} value={tipo.id}>
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="numeroDocumento" className={labelClass}>
                                        Número de Documento *
                                    </label>
                                    <input
                                        type="text"
                                        id="numeroDocumento"
                                        name="numeroDocumento"
                                        value={formData.numeroDocumento}
                                        onChange={handleDocumentoChange}
                                        placeholder={
                                            formData.tipoDocumento === 'pasaporte'
                                                ? 'Ej: A1234567'
                                                : 'Ej: 12345678'
                                        }
                                        className={inputClass}
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className={labelClass}>
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="juan@ejemplo.com"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="telefono" className={labelClass}>
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleTelefonoChange}
                                        placeholder="Ej: 1123456789"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
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
                                disabled={loading}
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

export default ClienteFormPage;
