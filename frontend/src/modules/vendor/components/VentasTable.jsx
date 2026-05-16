import { useState } from 'react';
import { CheckCircle2, Clock, History, FileText, Download } from 'lucide-react';
import { formatFecha } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { DataTable, DataTablePagination, DataTableToolbar } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { downloadBase64PDF } from '@/utils/pdfUtils';
import { exportToExcel } from '@/utils/exportUtils';
import { useSort } from '@/hooks/useSort';

const ITEMS_PER_PAGE = 10;

/**
 * Tabla estandarizada para mostrar ventas de un vendedor
 */
export default function VentasTable({
  data = [],
  emptyMessage = 'No se encontraron ventas.',
  fechaInicio,
  fechaFin,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const customComparators = {
    monto: (a, b) => Number(a.subtotal) - Number(b.subtotal),
    comision: (a, b) => Number(a.subtotal) * 0.02 - Number(b.subtotal) * 0.02,
    estado: (a, b) => {
      const stateA = a.liquidacionId ? 1 : 0;
      const stateB = b.liquidacionId ? 1 : 0;
      return stateA - stateB;
    },
  };
  const { sortedData, sortKey, sortDir, handleSort } = useSort(
    data,
    'fechaVenta',
    'desc',
    customComparators
  );

  const handleDownloadFactura = async (ventaId) => {
    try {
      setDownloadingId(ventaId);
      // Las rutas GET de visualización devuelven binario (Blob)
      const response = await axiosInstance.get(
        `/factura/${ventaId}/ver-factura`,
        {
          responseType: 'blob',
        }
      );

      const pdfData = response.data;
      if (!pdfData) throw new Error('Documento no disponible');

      downloadBase64PDF(pdfData, `Factura_${ventaId}.pdf`);
      toast.success('Factura descargada');
    } catch (error) {
      toast.error('Error al descargar la factura');
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (v) => (
        <span className="font-medium capitalize text-gray-900 dark:text-white">
          {v.descripcion}
        </span>
      ),
    },
    {
      key: 'fechaVenta',
      label: 'Fecha de Venta',
      render: (v) => (
        <span className="text-gray-500 dark:text-gray-400">
          {formatFecha(v.fechaVenta)}
        </span>
      ),
    },
    {
      key: 'monto',
      label: 'Monto',
      align: 'right',
      render: (v) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatCurrency(v.subtotal)}
        </span>
      ),
    },
    {
      key: 'comision',
      label: 'Comisión (2%)',
      align: 'right',
      render: (v) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatCurrency(Number(v.subtotal) * 0.02)}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Liquidación',
      align: 'center',
      render: (v) =>
        v.liquidacionId ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Liquidada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pendiente
          </span>
        ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (v) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="view"
            icon={FileText}
            onClick={() => handleDownloadFactura(v.id)}
            title="Descargar Factura"
            disabled={downloadingId === v.id}
          />
        </div>
      ),
    },
  ];

  // Datos planos formateados para exportar (excluye columna de Acciones)
  const handleExport = () => {
    const exportColumns = [
      { key: 'descripcion', label: 'Descripción' },
      { key: '_fechaFormateada', label: 'Fecha' },
      { key: '_monto', label: 'Monto' },
      { key: '_comision', label: 'Comisión (2%)' },
      { key: '_estado', label: 'Estado' },
    ];
    const exportData = data.map((v) => ({
      descripcion: v.descripcion,
      _fechaFormateada: formatFecha(v.fechaVenta),
      _monto: formatCurrency(v.subtotal),
      _comision: formatCurrency(Number(v.subtotal) * 0.02),
      _estado: v.liquidacionId ? 'Liquidada' : 'Pendiente',
    }));
    exportToExcel(exportData, exportColumns, 'ventas');
  };

  return (
    <div className="flex h-full flex-grow flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTableToolbar>
        <div className="flex w-full items-center justify-between">
          {/* Mostrar rango de fechas solo cuando no es "Todo el historial" */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {fechaInicio && fechaInicio !== '2010-01-01' && fechaFin ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Del {formatFecha(fechaInicio)} al {formatFecha(fechaFin)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={data.length === 0}
            title="Exportar a Excel"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={currentItems}
        emptyIcon={History}
        emptyMessage={emptyMessage}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
