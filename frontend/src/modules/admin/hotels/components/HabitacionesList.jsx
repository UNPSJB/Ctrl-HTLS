import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { Loading } from '@/components/ui/Loading';

// Listado gestionable de habitaciones para un hotel
export default function HabitacionesList({ hotelId, tiposDisponibles, localRooms = [], onLocalChange }) {
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const isLocalMode = !hotelId;

    useEffect(() => {
        if (!isLocalMode) {
            fetchHabitaciones();
        } else {

            setHabitaciones(localRooms);
        }
    }, [hotelId, localRooms, isLocalMode]);

    // Carga habitaciones existentes del servidor
    const fetchHabitaciones = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/hotel/${hotelId}`);
            if (res.data.habitaciones) {
                setHabitaciones(res.data.habitaciones);
            }
        } catch (error) {
            console.error("Failed to fetch habitaciones", error);
        } finally {
            setLoading(false);
        }
    };

    // Crea o actualiza una habitación
    const onSubmit = async (data) => {
        try {
            const payload = {
                numero: Number(data.numero),
                piso: Number(data.piso),
                tipoHabitacionId: Number(data.tipoHabitacionId)
            };

            const tipoObj = tiposDisponibles.find(t => t.id === payload.tipoHabitacionId);

            if (isLocalMode) {

                if (editingId) {
                    const updated = habitaciones.map(h => h.tempId === editingId ? { ...payload, tempId: editingId, tipoHabitacion: tipoObj } : h);
                    onLocalChange(updated);
                    toast.success('Habitación actualizada (Borrador)');
                } else {

                    const newRoom = { ...payload, tempId: Date.now(), tipoHabitacion: tipoObj };
                    onLocalChange([...habitaciones, newRoom]);
                    toast.success('Habitación agregada (Borrador)');
                }
            } else {

                if (editingId) {
                    await axiosInstance.put(`/hotel/${hotelId}/habitacion/${editingId}`, payload);
                    toast.success('Habitación actualizada');
                } else {
                    await axiosInstance.post(`/hotel/${hotelId}/habitacion`, payload);
                    toast.success('Habitación creada');
                }
                fetchHabitaciones();
            }

            setIsCreating(false);
            setEditingId(null);
            reset();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al guardar habitación');
        }
    };

    // Elimina una habitación tras confirmación
    const handleDelete = async (habitacionId, tempId) => {
        if (!window.confirm('¿Confirma eliminar esta habitación?')) return;

        if (isLocalMode) {
            const updated = habitaciones.filter(h => h.tempId !== tempId);
            onLocalChange(updated);
            toast.success('Habitación eliminada (Borrador)');
        } else {
            try {
                await axiosInstance.delete(`/hotel/${hotelId}/habitacion/${habitacionId}`);
                toast.success('Habitación eliminada');
                fetchHabitaciones();
            } catch (error) {
                console.error(error);
                toast.error('Error al eliminar');
            }
        }
    };

    const startEdit = (habitacion) => {
        setEditingId(isLocalMode ? habitacion.tempId : habitacion.id);
        setIsCreating(true);
        setValue('numero', habitacion.numero);
        setValue('piso', habitacion.piso);
        setValue('tipoHabitacionId', habitacion.tipoHabitacionId);
    };

    const cancelForm = () => {
        setIsCreating(false);
        setEditingId(null);
        reset();
    };

    if (!tiposDisponibles || tiposDisponibles.length === 0) {
        return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Primero debes configurar el "Tarifas" (Tipos de habitación y precios) para poder crear habitaciones físicas.
        </div>
    }

    return (
        <div className="space-y-6">
            {/* Encabezado y Botón Nuevo */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Habitaciones Físicas</h3>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> Nueva Habitación
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-top-2">
                    {/* Formulario de Creación/Edición */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                            <input
                                type="number"
                                {...register('numero', { required: 'Requerido' })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                placeholder="101"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                            {errors.numero && <span className="text-red-500 text-xs">{errors.numero.message}</span>}
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Piso</label>
                            <input
                                type="number"
                                {...register('piso', { required: 'Requerido' })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                placeholder="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                            {errors.piso && <span className="text-red-500 text-xs">{errors.piso.message}</span>}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                            <select
                                {...register('tipoHabitacionId', { required: 'Requerido' })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            >
                                <option value="">Seleccionar...</option>
                                {tiposDisponibles.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre || `Tipo #${t.id}`}</option>
                                ))}
                            </select>
                            {errors.tipoHabitacionId && <span className="text-red-500 text-xs">{errors.tipoHabitacionId.message}</span>}
                        </div>
                        <div className="flex gap-2 pb-0.5">
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                                <Plus className="w-3 h-3" /> Crear
                            </button>
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <Loading />
            ) : (
                <div className="rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                    {/* Tabla de Habitaciones */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-4 py-3">Número</th>
                                <th className="px-4 py-3">Piso</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {habitaciones.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No hay habitaciones físicas creadas aún.
                                    </td>
                                </tr>
                            ) : (
                                habitaciones.map(habitacion => {
                                    const tipo = tiposDisponibles.find(t => t.id === habitacion.tipoHabitacionId);
                                    return (
                                        <tr key={habitacion.id || habitacion.tempId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{habitacion.numero}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{habitacion.piso}° Piso</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {tipo?.nombre || habitacion.tipoHabitacion?.nombre || 'Desconocido'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button type="button" onClick={() => startEdit(habitacion)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(habitacion.id, habitacion.tempId)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
