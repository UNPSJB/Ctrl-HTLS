import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Save, X, Edit } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const tiposDocumento = [
    { id: 'dni', nombre: 'DNI' },
    { id: 'li', nombre: 'LI' },
    { id: 'le', nombre: 'LE' },
    { id: 'pasaporte', nombre: 'Pasaporte' },
];

const ClienteFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const fetchCliente = async () => {
        try {
            setLoadingData(true);
            const response = await axiosInstance.get(`/cliente/${id}`);
            const data = response.data;
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

    if (loadingData) {
        return <div className="p-8 text-center">Cargando datos...</div>;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        {isEditing ? (
                            <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEditing
                                ? 'Actualice los datos del cliente seleccionado.'
                                : 'Ingrese los datos personales para dar de alta un cliente.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
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

                    <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
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
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-50"
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
            </div>
        </div>
    );
};

export default ClienteFormPage;
