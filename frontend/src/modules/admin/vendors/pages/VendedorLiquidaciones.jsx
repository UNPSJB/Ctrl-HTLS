import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Receipt,
  History,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { PageHeader } from '@admin-ui';
import { capitalizeFirst } from '@/utils/stringUtils';

// Detalle de ventas y liquidaciones de un vendedor
const VendedorLiquidaciones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [vendedor, setVendedor] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);

  const [activeTab, setActiveTab] = useState('liquidacion');
  const [selectedVentas, setSelectedVentas] = useState([]);

  // Cálculos derivados
  const pendingSales = ventas.filter((v) => !v.liquidacionId);
  const liquidatedSales = ventas.filter((v) => !!v.liquidacionId);
  
  const totalSalesAmount = ventas.reduce((acc, curr) => acc + Number(curr.subtotal), 0);
  const pendingAmount = pendingSales.reduce((acc, curr) => acc + Number(curr.subtotal), 0) * 0.02;
  const totalPaid = liquidaciones.reduce((acc, curr) => acc + Number(curr.total), 0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      setVendedor(response.data);
      setVentas(response.data.ventas || []);
      setLiquidaciones(response.data.liquidaciones || []);
      setSelectedVentas([]); // Limpiar selección al recargar
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/vendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeleccion = (ventaId) => {
    setSelectedVentas((prev) =>
      prev.includes(ventaId)
        ? prev.filter((id) => id !== ventaId)
        : [...prev, ventaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVentas.length === pendingSales.length) {
      setSelectedVentas([]);
    } else {
      setSelectedVentas(pendingSales.map((v) => v.id));
    }
  };

  const handleLiquidarSeleccionadas = async () => {
    if (selectedVentas.length === 0) return;
    
    const montoComision = (selectedVentas.reduce((acc, vId) => {
        const v = ventas.find(vent => vent.id === vId);
        return acc + (v ? Number(v.subtotal) : 0);
    }, 0) * 0.02).toFixed(2);

    if (!window.confirm(`¿Desea liquidar las ${selectedVentas.length} ventas seleccionadas?\nTotal Comisión: $${montoComision}`)) {
      return;
    }

    try {
      setLoadingAction(true);
      // PREPARADO PARA FUTURO ENDPOINT (POST /liquidaciones/liquidar-seleccion)
      toast.success('Petición preparada (Esperando backend)');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al procesar la liquidación');
    } finally {
      setLoadingAction(false);
    }
  };

  const TABS = [
    { id: 'liquidacion', label: 'Resumen y Liquidación', icon: DollarSign },
    { id: 'historial-ventas', label: 'Ventas Liquidadas', icon: History },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Encabezado con Datos del Vendedor */}
      <div className="flex-shrink-0">
        <PageHeader
          title={vendedor ? `Vendedor: ${capitalizeFirst(vendedor.nombre)} ${capitalizeFirst(vendedor.apellido)}` : 'Cargando...'}
          description="Gestión integral de ventas comerciales y comisiones"
          backTo="/admin/vendedores"
          icon={TrendingUp}
          loading={loading && !vendedor}
        />
      </div>

      {/* Selector de Pestañas */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl px-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading && !vendedor}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors disabled:opacity-50 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de Pestañas */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {loading && !vendedor ? (
          <div className="flex-1 flex items-center justify-center">
            <InnerLoading message="Cargando..." />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 h-full flex flex-col">

            {/* ─── PESTAÑA: Resumen y Liquidación ─── */}
            {activeTab === 'liquidacion' && (
              <div className="flex-grow flex flex-col gap-6 overflow-hidden">
                {/* Dashboard Metrics */}
                <div className="flex-shrink-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Total Facturado</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">${totalSalesAmount.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm dark:border-amber-900/10 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Ventas Pendientes</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pendingSales.length}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900/10 dark:bg-gray-800 text-orange-600">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Por Liquidar</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-900/10 dark:bg-gray-800 text-emerald-600">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Total Pagado</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of Pending Sales */}
                <div className="flex-grow flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                  <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas por Liquidar</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione los elementos para procesar la liquidación</p>
                    </div>
                    
                    <button
                      onClick={handleLiquidarSeleccionadas}
                      disabled={selectedVentas.length === 0 || loadingAction}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 shadow-md transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      <DollarSign className="h-4 w-4" />
                      Liquidar
                    </button>
                  </div>
                  
                  <div className="flex-grow overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm relative">
                      <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-3 w-10">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedVentas.length === pendingSales.length && pendingSales.length > 0}
                              onChange={handleSelectAll}
                              disabled={pendingSales.length === 0}
                            />
                          </th>
                          <th className="px-6 py-3">Descripción</th>
                          <th className="px-6 py-3 text-right">Monto</th>
                          <th className="px-6 py-3 text-right">Comisión (2%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingSales.length > 0 ? (
                          pendingSales.map((v) => (
                            <tr key={v.id} className="transition-colors hover:bg-blue-50/20 dark:hover:bg-blue-900/10">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                                  checked={selectedVentas.includes(v.id)}
                                  onChange={() => handleToggleSeleccion(v.id)}
                                />
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{v.descripcion}</td>
                              <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                                ${Number(v.subtotal).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                                ${(Number(v.subtotal) * 0.02).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                              No hay ventas pendientes.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── PESTAÑA: Ventas Liquidadas ─── */}
            {activeTab === 'historial-ventas' && (
              <div className="h-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Ventas</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ventas que ya han sido procesadas</p>
                </div>
                
                <div className="flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3">Descripción</th>
                        <th className="px-6 py-3 text-right">Monto</th>
                        <th className="px-6 py-3 text-right">Comisión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {liquidatedSales.length > 0 ? (
                        liquidatedSales.map((v) => (
                          <tr key={v.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{v.descripcion}</td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                              ${Number(v.subtotal).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                              ${(Number(v.subtotal) * 0.02).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                            No hay registros de ventas liquidadas.
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
