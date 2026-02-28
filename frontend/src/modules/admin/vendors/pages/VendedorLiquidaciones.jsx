import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import DateDisplay from '@ui/DateDisplay';
import { Loading } from '@ui/Loading';
import { InnerLoading } from '@/components/ui/InnerLoading';

// Detalle de ventas y liquidaciones de un vendedor
const VendedorLiquidaciones = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vendedor, setVendedor] = useState(null);
    const [ventas, setVentas] = useState([]);
    const [liquidaciones, setLiquidaciones] = useState([]);

    const [activeTab, setActiveTab] = useState('resumen');

    const pendingSales = ventas.filter(v => !v.liquidacionId);
    const pendingAmount = pendingSales.reduce((acc, curr) => acc + Number(curr.subtotal), 0) * 0.02;
    const totalPaid = liquidaciones.reduce((acc, curr) => acc + Number(curr.total), 0);

    useEffect(() => {
        fetchData();
    }, [id]);

    // Obtiene datos de ventas y liquidaciones del servidor
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/vendedor/${id}`);
            setVendedor(response.data);
            setVentas(response.data.ventas || []);
            setLiquidaciones(response.data.liquidaciones || []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del vendedor');
            navigate('/admin/vendedores');
        } finally {
            setLoading(false);
        }
    };

    // Procesa la liquidación para el periodo seleccionado
    const handleLiquidar = async () => {
        const start = document.getElementById('liq-start').value;
        const end = document.getElementById('liq-end').value;

        if (!start || !end) {
            toast.error('Por favor seleccione un rango de fechas');
            return;
        }

        if (!window.confirm('¿Está seguro de generar la liquidación para este periodo?')) {
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post(`/liquidaciones/liquidar/${id}`, {
                fechaInicio: start,
                fechaFin: end
            });
            toast.success('Liquidación generada correctamente');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al generar liquidación');
            setLoading(false);
        }
    };

    // if (loading && !vendedor) return <Loading />;

    return (
        <div className="mx-auto max-w-6xl space-y-6">

            {/* Encabezado con Datos del Vendedor */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button
                    onClick={() => navigate('/admin/vendedores')}
                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <DollarSign className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Liquidaciones: {vendedor ? `${vendedor.nombre} ${vendedor.apellido}` : 'Cargando...'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vendedor ? `${vendedor.tipoDocumento}: ${vendedor.numeroDocumento}` : 'Obteniendo información del vendedor...'}
                    </p>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl px-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('resumen')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'resumen'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Resumen y Liquidar
                    </button>
                    <button
                        onClick={() => setActiveTab('ventas')}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'ventas'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Historial de Ventas
                    </button>
                </nav>
            </div>

            <div className="min-h-[400px]">
                {loading && !vendedor ? (
                    <InnerLoading message="Cargando datos de liquidación..." />
                ) : (
                    <div className="animate-in fade-in duration-500">
                        {activeTab === 'resumen' && (
                            <>
                                {/* Tarjetas de Resumen Dinámico */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                <AlertCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendiente de Pago</p>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${pendingAmount.toFixed(2)}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Liquidado Histórico</p>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalPaid.toFixed(2)}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Liquidaciones Generadas</p>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{liquidaciones.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="space-y-6">
                                        {/* Sección para Generar Nueva Liquidación */}
                                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                                            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generar Nueva Liquidación</h2>
                                            </div>
                                            <div className="p-6">
                                                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                                    Seleccione el periodo para calcular y registrar las comisiones pendientes.
                                                </p>

                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Fecha Inicio
                                                            </label>
                                                            <div className="relative">
                                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <input
                                                                    type="date"
                                                                    id="liq-start"
                                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Fecha Fin
                                                            </label>
                                                            <div className="relative">
                                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <input
                                                                    type="date"
                                                                    id="liq-end"
                                                                    defaultValue={new Date().toISOString().split('T')[0]}
                                                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleLiquidar}
                                                        disabled={loading || pendingSales.length === 0}
                                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all shadow-sm"
                                                    >
                                                        {loading ? 'Procesando...' : (
                                                            <>
                                                                <DollarSign className="h-4 w-4" />
                                                                Liquidación del Periodo
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                                            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas Pendientes</h2>
                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {pendingSales.length} items
                                                </span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0 dark:bg-gray-700 dark:text-gray-400 z-10 shadow-sm">
                                                        <tr>
                                                            <th className="px-6 py-3">Descripción</th>
                                                            <th className="px-6 py-3 text-right">Monto</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {pendingSales.length > 0 ? (
                                                            pendingSales.map((v) => (
                                                                <tr key={v.id} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 transition-colors">
                                                                    <td className="px-6 py-4">{v.descripcion}</td>
                                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                                                        ${Number(v.subtotal).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="2" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                                    No hay ventas pendientes.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabla de Historial de Pagos */}
                                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 h-fit overflow-hidden">
                                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Pagos</h2>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        <th className="px-6 py-3">Nro</th>
                                                        <th className="px-6 py-3">Fecha</th>
                                                        <th className="px-6 py-3 text-right">Total</th>
                                                        <th className="px-6 py-3 text-center">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {liquidaciones.length > 0 ? (
                                                        liquidaciones.map((l) => (
                                                            <tr key={l.id} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 transition-colors">
                                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{l.numero}</td>
                                                                <td className="px-6 py-4"><DateDisplay date={l.fechaEmision} /></td>
                                                                <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                                                    ${Number(l.total).toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                        <CheckCircle2 className="h-3 w-3" /> Pagado
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                                Sin historial de liquidaciones.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'ventas' && (
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Ventas</h2>
                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {ventas.length} ventas totales
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">ID</th>
                                                <th className="px-6 py-3">Descripción</th>
                                                <th className="px-6 py-3 text-right">Monto Venta</th>
                                                <th className="px-6 py-3 text-right">Comisión (2%)</th>
                                                <th className="px-6 py-3 text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {ventas.length > 0 ? (
                                                ventas.map((v) => (
                                                    <tr key={v.id} className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="px-6 py-4 text-xs font-mono text-gray-400">#{v.id}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                            {v.descripcion}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            ${Number(v.subtotal).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                                                            ${(Number(v.subtotal) * 0.02).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {v.liquidacionId ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                    <CheckCircle2 className="h-3 w-3" /> Pagado
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                    <AlertCircle className="h-3 w-3" /> Pendiente
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                        Sin historial de ventas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorLiquidaciones;
