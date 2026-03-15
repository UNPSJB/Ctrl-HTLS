import { useState, useEffect } from 'react';
import { UserPlus, Trash2, X, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { InnerLoading } from '@/components/ui/InnerLoading';

export default function VendedoresAsignadosList({ hotelId, asignadosIniciales = [], onUpdateAsignados }) {
    const [asignados, setAsignados] = useState(asignadosIniciales);
    const [todosVendedores, setTodosVendedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedVendedorId, setSelectedVendedorId] = useState('');

    useEffect(() => {
        setAsignados(asignadosIniciales);
    }, [asignadosIniciales]);

    useEffect(() => {
        fetchTodosVendedores();
    }, []);

    const fetchTodosVendedores = async () => {
        try {
            const res = await axiosInstance.get('/vendedores');
            setTodosVendedores(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la lista de vendedores');
        }
    };

    const handleAsignar = async () => {
        if (!selectedVendedorId) return;

        try {
            setLoading(true);
            await axiosInstance.post('/hotel/asignar-empleado', {
                hotelId: Number(hotelId),
                vendedorId: Number(selectedVendedorId)
            });
            
            toast.success('Vendedor asignado exitosamente');
            
            // Refrescar los asignados notificando al padre para que refetch
            if(onUpdateAsignados) {
                onUpdateAsignados();
            }
            
            setIsAssigning(false);
            setSelectedVendedorId('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al asignar vendedor');
        } finally {
            setLoading(false);
        }
    };

    const handleDesasignar = async (vendedorId) => {
        if (!window.confirm('¿Confirma remover este vendedor de la lista?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post('/hotel/desasignar-empleado', {
                hotelId: Number(hotelId),
                vendedorId: Number(vendedorId)
            });
            
            toast.success('Vendedor removido del hotel');
             
            // Refrescar notificando al padre
            if(onUpdateAsignados) {
                onUpdateAsignados();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al remover vendedor');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar los vendedores que ya están asignados
    const vendedoresDisponibles = todosVendedores.filter(
        (v) => !asignados.some((a) => Number(a.empleadoId) === Number(v.id))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    Personal Asignado
                </h3>
                {!isAssigning && (
                    <button
                        onClick={() => setIsAssigning(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" /> Asignar Vendedor
                    </button>
                )}
            </div>

            {isAssigning && (
                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                Seleccionar Vendedor
                            </label>
                            <select
                                value={selectedVendedorId}
                                onChange={(e) => setSelectedVendedorId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            >
                                <option value="">Seleccione un vendedor de la lista...</option>
                                {vendedoresDisponibles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nombre} {v.apellido} ({v.email})
                                    </option>
                                ))}
                            </select>
                            {vendedoresDisponibles.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">Todos los vendedores disponibles ya están asignados.</p>
                            )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <button
                                onClick={handleAsignar}
                                disabled={!selectedVendedorId || loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Asignar
                            </button>
                            <button
                                onClick={() => {
                                    setIsAssigning(false);
                                    setSelectedVendedorId('');
                                }}
                                disabled={loading}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && !isAssigning ? (
                <InnerLoading message="Procesando..." />
            ) : (
                <div className="rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Nombre del Vendedor</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Documento</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {asignados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No hay vendedores asignados a este hotel.
                                    </td>
                                </tr>
                            ) : (
                                asignados.map((vendedor) => (
                                    <tr key={vendedor.empleadoId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-xs uppercase">
                                                {vendedor.empleadoNombre?.charAt(0)}{vendedor.empleadoApellido?.charAt(0)}
                                            </div>
                                            {vendedor.empleadoNombre} {vendedor.empleadoApellido}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {vendedor.empleadoEmail || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            <span className="text-xs text-gray-400 uppercase tracking-wide mr-1">{vendedor.empleadoTipoDocumento}</span>
                                            {vendedor.empleadoNumeroDocumento || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDesasignar(vendedor.empleadoId)}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/20"
                                                title="Remover Asignación"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
