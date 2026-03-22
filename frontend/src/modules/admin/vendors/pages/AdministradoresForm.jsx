import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, Lock, MapPin, Briefcase, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { useBreadcrumbs } from '@/context/BreadcrumbContext';
import UbicacionSelector from '@/components/selectors/UbicacionSelector';

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
        formState: { errors, isValid }
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



    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const tipoDocumento = watch('tipoDocumento');

    useEffect(() => {
        if (isEditing) {
            fetchAdmin();
        }
    }, [id]);

    const fetchAdmin = async () => {
        try {
            setLoadingData(true);
            const response = await axiosInstance.get(`/vendedor/${id}`);
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
                direccion: data.direccion || '',
                password: '',
                rol: 'administrador',
            });

            if (data.ubicacion) {
                setValue('paisId', data.ubicacion.paisId);
                setValue('provinciaId', data.ubicacion.provinciaId);
                setValue('ciudadId', data.ubicacion.ciudadId);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del administrador');
            navigate('/admin/personal/administradores');
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
        setValue(e.target.name, e.target.value.replace(/\D/g, ''));
    };

    const handleTipoChange = (e) => {
        setValue('tipoDocumento', e.target.value);
        setValue('numeroDocumento', '');
    };



    const onSubmit = async (data) => {
        setLoading(true);

        if (isEditing && !data.password) delete data.password;

        try {
            if (isEditing) {
                await axiosInstance.put(`/empleado/${id}`, data);
                toast.success('Administrador actualizado');
            } else {
                await axiosInstance.post('/empleado', data);
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

    const inputClass = (error) =>
        `w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all`;
    const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
    const errorClass = 'mt-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1';

    return (
        <div className="space-y-6">

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
                        <span>{isEditing ? `${watch('nombre')} ${watch('apellido')}` : 'Gestión de accesos'}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">

                {/* Menú Lateral de Secciones */}
                <aside className="w-full lg:w-80 shrink-0">
                    <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <button type="button" onClick={() => setActiveTab('general')} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <User className="h-5 w-5" /> Principal
                        </button>
                        <button type="button" onClick={() => setActiveTab('ubicacion')} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'ubicacion' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <MapPin className="h-5 w-5" /> Contacto
                        </button>
                        <button type="button" onClick={() => setActiveTab('seguridad')} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'seguridad' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            <Lock className="h-5 w-5" /> Seguridad
                        </button>
                    </nav>
                </aside>

                {/* Formulario Prinicipal */}
                <div className="flex-1 w-full min-w-0">
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
                                                <label htmlFor="nombre" className={labelClass}>Nombres Completos *</label>
                                                <input
                                                    type="text"
                                                    id="nombre"
                                                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                                                    className={inputClass(errors.nombre)}
                                                    placeholder="Ej: Juan Antonio"
                                                />
                                                {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="apellido" className={labelClass}>Apellidos *</label>
                                                <input
                                                    type="text"
                                                    id="apellido"
                                                    {...register('apellido', { required: 'El apellido es obligatorio' })}
                                                    className={inputClass(errors.apellido)}
                                                    placeholder="Ej: Pérez García"
                                                />
                                                {errors.apellido && <p className={errorClass}>{errors.apellido.message}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="tipoDocumento" className={labelClass}>Identificación *</label>
                                                <select
                                                    id="tipoDocumento"
                                                    {...register('tipoDocumento', { onChange: handleTipoChange })}
                                                    className={inputClass(errors.tipoDocumento)}
                                                >
                                                    {tiposDocumento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="numeroDocumento" className={labelClass}>Nº de Documento *</label>
                                                <input
                                                    type="text"
                                                    id="numeroDocumento"
                                                    {...register('numeroDocumento', {
                                                        required: 'El documento es obligatorio',
                                                        onChange: handleDocumentoChange
                                                    })}
                                                    className={inputClass(errors.numeroDocumento)}
                                                    maxLength={15}
                                                    placeholder="Sin puntos ni guiones"
                                                />
                                                {errors.numeroDocumento && <p className={errorClass}>{errors.numeroDocumento.message}</p>}
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
                                                <input
                                                    type="email"
                                                    id="email"
                                                    {...register('email', {
                                                        required: 'El email es obligatorio',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Email inválido'
                                                        }
                                                    })}
                                                    className={inputClass(errors.email)}
                                                    placeholder="admin@empresa.com"
                                                />
                                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="telefono" className={labelClass}>Línea de Contacto</label>
                                                <input
                                                    type="text"
                                                    id="telefono"
                                                    {...register('telefono', { onChange: handleNumericChange })}
                                                    className={inputClass(errors.telefono)}
                                                    placeholder="Cod. área + número"
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <label htmlFor="direccion" className={labelClass}>Residencia Física *</label>
                                                <input
                                                    type="text"
                                                    id="direccion"
                                                    {...register('direccion', { required: 'La dirección es obligatoria' })}
                                                    className={inputClass(errors.direccion)}
                                                    placeholder="Ej: Av. Principal 123, Depto B"
                                                />
                                                {errors.direccion && <p className={errorClass}>{errors.direccion.message}</p>}
                                            </div>
                                            <UbicacionSelector
                                                errors={errors}
                                                register={register}
                                                setValue={setValue}
                                                watch={watch}
                                            />
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
                                            <label htmlFor="password" className={labelClass}>{isEditing ? 'Reestablecer Contraseña (opcional)' : 'Nueva Contraseña *'}</label>
                                            <input
                                                type="password"
                                                id="password"
                                                {...register('password', {
                                                    required: !isEditing ? 'La contraseña es obligatoria' : false,
                                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                                })}
                                                placeholder="••••••••"
                                                className={inputClass(errors.password)}
                                            />
                                            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
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
