import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, Lock, MapPin, Briefcase, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useUbicacion from '@/hooks/useUbicacion';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';

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
        paises,
        provincias,
        ciudades,
        paisId,
        provinciaId,
        ciudadId,
        handlePaisChange,
        handleProvinciaChange,
        handleCiudadChange,
        isProvinciasDisabled,
        isCiudadesDisabled,
        setInitialUbicacion,
    } = useUbicacion();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipoDocumento: 'dni',
        numeroDocumento: '',
        direccion: '',
        password: '',
        rol: 'administrador',
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isEditing) {
            fetchAdmin();
        }
    }, [id]);

    const fetchAdmin = async () => {
        try {
            setLoadingData(true);
            // Nota: El backend actualmente usa el mismo endpoint para cualquier empleado
            const response = await axiosInstance.get(`/vendedor/${id}`);
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
                direccion: data.direccion || '',
                password: '',
                rol: 'administrador',
            });

            if (data.ubicacion) {
                setInitialUbicacion(
                    data.ubicacion.paisId,
                    data.ubicacion.provinciaId,
                    data.ubicacion.ciudadId
                );
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del administrador');
            navigate('/admin/personal/administradores');
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
        let procesado = value.replace(tipo === 'pasaporte' ? /[^a-zA-Z0-9]/g : /\D/g, '');
        if (tipo === 'pasaporte') procesado = procesado.toUpperCase();

        setFormData((prev) => ({ ...prev, numeroDocumento: procesado }));
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    };

    const handleTipoChange = (e) => {
        setFormData((prev) => ({ ...prev, tipoDocumento: e.target.value, numeroDocumento: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (
            !formData.nombre ||
            !formData.apellido ||
            !formData.numeroDocumento ||
            !formData.email ||
            (!isEditing && !formData.password) ||
            !formData.direccion ||
            !ciudadId
        ) {
            toast.error('Por favor complete todos los campos obligatorios');
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            ciudadId: ciudadId,
        };

        if (isEditing && !payload.password) delete payload.password;

        try {
            if (isEditing) {
                await axiosInstance.put(`/empleado/${id}`, payload);
                toast.success('Administrador actualizado');
            } else {
                await axiosInstance.post('/empleado', payload);
                toast.success('Administrador registrado');
            }
            navigate('/admin/personal/administradores');
        } catch (error) {
            console.error(error);
            const mensaje = error.response?.data?.error || 'Error al guardar administrador';
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/admin/personal/administradores');

    const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all';
    const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* Perfil del Administrador / Encabezado */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? `Editar Administrador` : 'Nuevo Administrador'}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{isEditing ? `${formData.nombre} ${formData.apellido}` : 'Gestión de accesos'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

                {/* Menú Lateral de Secciones */}
                <div className="lg:col-span-1">
                    <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <button type="button" onClick={() => setActiveTab('general')} className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <User className="h-4 w-4" /> Principal
                        </button>
                        <button type="button" onClick={() => setActiveTab('ubicacion')} className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'ubicacion' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <MapPin className="h-4 w-4" /> Contacto
                        </button>
                        <button type="button" onClick={() => setActiveTab('seguridad')} className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'seguridad' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <Lock className="h-4 w-4" /> Seguridad
                        </button>
                    </nav>
                </div>

                {/* Formulario Prinicipal */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px] flex flex-col">

                        {loadingData ? (
                            <InnerLoading message="Consultando privilegios..." />
                        ) : (
                            <div className="flex-1 space-y-6">
                                {activeTab === 'general' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identidad Administrativa</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="nombre" className={labelClass}>Nombre Completos *</label>
                                                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass} placeholder="Ej: Juan Antonio" />
                                            </div>
                                            <div>
                                                <label htmlFor="apellido" className={labelClass}>Apellidos *</label>
                                                <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={inputClass} placeholder="Ej: Pérez García" />
                                            </div>
                                            <div>
                                                <label htmlFor="tipoDocumento" className={labelClass}>Identificación *</label>
                                                <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleTipoChange} className={inputClass}>
                                                    {tiposDocumento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="numeroDocumento" className={labelClass}>Nº de Documento *</label>
                                                <input type="text" id="numeroDocumento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleDocumentoChange} className={inputClass} maxLength={15} placeholder="Sin puntos ni guiones" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ubicacion' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación Geográfica</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="email" className={labelClass}>Email Corporativo *</label>
                                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="admin@empresa.com" />
                                            </div>
                                            <div>
                                                <label htmlFor="telefono" className={labelClass}>Línea de Contacto</label>
                                                <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleNumericChange} className={inputClass} placeholder="Cod. área + número" />
                                            </div>
                                            <div className="col-span-full">
                                                <label htmlFor="direccion" className={labelClass}>Residencia Física *</label>
                                                <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className={inputClass} placeholder="Ej: Av. Principal 123, Depto B" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Estado / País *</label>
                                                <select value={paisId} onChange={(e) => handlePaisChange(e.target.value)} className={inputClass}>
                                                    <option value="">Seleccione país</option>
                                                    {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Provincia / Región *</label>
                                                <select value={provinciaId} onChange={(e) => handleProvinciaChange(e.target.value)} className={inputClass} disabled={isProvinciasDisabled}>
                                                    <option value="">Seleccione provincia</option>
                                                    {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Ciudad / Distrito *</label>
                                                <select value={ciudadId} onChange={(e) => handleCiudadChange(e.target.value)} className={inputClass} disabled={isCiudadesDisabled}>
                                                    <option value="">Seleccione ciudad</option>
                                                    {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'seguridad' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Credenciales de Acceso</h3>
                                        </div>
                                        <div className="max-w-md">
                                            <label htmlFor="password" className={labelClass}>{isEditing ? 'Reestablecer Contraseña' : 'Nueva Contraseña *'}</label>
                                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                                            <p className="mt-3 text-[11px] text-gray-500 italic flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3" />
                                                {isEditing
                                                    ? 'Complete solo si desea cambiar la clave actual de este administrador.'
                                                    : 'Se recomienda usar una mezcla de letras, números y símbolos.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                disabled={loading || loadingData}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {loading ? 'Guardando...' : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {isEditing ? 'Guardar Cambios' : 'Registrar Administrador'}
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdministradoresForm;
