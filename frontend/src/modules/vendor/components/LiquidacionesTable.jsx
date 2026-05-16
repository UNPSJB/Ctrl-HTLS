import { useState } from 'react';
import { CheckCircle2, Clock, Receipt, Download } from 'lucide-react';
import { formatFecha, parseDate } from '@/utils/dateUtils';
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
 * Tabla estandarizada para mostrar liquidaciones de un vendedor
 */
export default function LiquidacionesTable({ data = [], fechaInicio, fechaFin }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const customComparators = {
    numero: (a, b) => Number(a.numero) - Number(b.numero),
    fechaEmision: (a, b) => parseDate(a.fechaEmision) - parseDate(b.fechaEmision),
    fechaPago: (a, b) => {
      const dateA = a.fechaPago ? parseDate(a.fechaPago) : new Date(0);
      const dateB = b.fechaPago ? parseDate(b.fechaPago) : new Date(0);
      return dateA - dateB;
    },
    total: (a, b) => Number(a.total) - Number(b.total),
    estado: (a, b) => {
      const stateA = a.fechaPago ? 1 : 0;
      const stateB = b.fechaPago ? 1 : 0;
      return stateA - stateB;
    }
  };

  const { sortedData, sortKey, sortDir, handleSort } = useSort(data, 'fechaEmision', 'desc', customComparators);

  const handleDownloadRecibo = async (liquidacionId) => {
    try {
      setDownloadingId(liquidacionId);
      const response = await axiosInstance.get(
        `/liquidaciones/${liquidacionId}/ver-recibo`,
        {
          responseType: 'blob',
        }
      );
      const pdfData = response.data;

      if (!pdfData) throw new Error('Documento no disponible');

      downloadBase64PDF(pdfData, `Recibo_Liquidacion_${liquidacionId}.pdf`);
      toast.success('Recibo descargado');
    } catch (error) {
      toast.error('Error al descargar el recibo');
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
      key: 'numero',
      label: 'Referencia',
      render: (l) => (
        <span className="font-mono text-xs text-gray-500">#{l.numero}</span>
      ),
    },
    {
      key: 'fechaEmision',
      label: 'Fecha Emisión',
      render: (l) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatFecha(l.fechaEmision)}
        </span>
      ),
    },
    {
      key: 'fechaPago',
      label: 'Fecha Pago',
      render: (l) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatFecha(l.fechaPago)}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total Comisión',
      align: 'right',
      render: (l) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(l.total)}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (l) =>
        l.fechaPago ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Cobrada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Por Cobrar
          </span>
        ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (l) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="view"
            icon={Download}
            onClick={() => handleDownloadRecibo(l.id)}
            title="Descargar Recibo de Liquidación"
            disabled={downloadingId === l.id}
          />
        </div>
      ),
    },
  ];

  // Datos planos formateados para exportar (excluye columna de Acciones)
  const handleExport = () => {
    const exportColumns = [
      { key: '_numero', label: 'Referencia' },
      { key: '_fechaEmision', label: 'Fecha Emisión' },
      { key: '_fechaPago', label: 'Fecha Pago' },
      { key: '_total', label: 'Total Comisión' },
      { key: '_estado', label: 'Estado' },
    ];
    const exportData = sortedData.map((l) => ({
      _numero: `#${l.numero}`,
      _fechaEmision: formatFecha(l.fechaEmision),
      _fechaPago: formatFecha(l.fechaPago),
      _total: formatCurrency(l.total),
      _estado: l.fechaPago ? 'Cobrada' : 'Por Cobrar',
    }));
    exportToExcel(exportData, exportColumns, 'liquidaciones');
  };

  return (
    <div className="flex h-full flex-grow flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTableToolbar>
        <div className="flex w-full items-center justify-between">
          {/* Mostrar rango de fechas solo cuando no es "Todo el historial" */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {fechaInicio && fechaInicio !== '2010-01-01' && fechaFin ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Del {formatFecha(fechaInicio)} al {formatFecha(fechaFin)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={sortedData.length === 0}
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
        emptyIcon={Receipt}
        emptyMessage="No hay liquidaciones registradas."
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
