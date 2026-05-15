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

const ITEMS_PER_PAGE = 10;

/**
 * Tabla estandarizada para mostrar ventas de un vendedor
 */
export default function VentasTable({ data = [], emptyMessage = "No se encontraron ventas." }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadFactura = async (ventaId) => {
    try {
      setDownloadingId(ventaId);
      // Las rutas GET de visualización devuelven binario (Blob)
      const response = await axiosInstance.get(`/factura/${ventaId}/ver-factura`, {
        responseType: 'blob'
      });
      
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

  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (v) => <span className="font-medium text-gray-900 dark:text-white capitalize">{v.descripcion}</span>
    },
    {
      key: 'fechaVenta',
      label: 'Fecha',
      render: (v) => <span className="text-gray-500 dark:text-gray-400">{formatFecha(v.fechaVenta)}</span>
    },
    {
      key: 'monto',
      label: 'Monto',
      align: 'right',
      render: (v) => <span className="text-gray-700 dark:text-gray-300">{formatCurrency(v.subtotal)}</span>
    },
    {
      key: 'comision',
      label: 'Comisión (2%)',
      align: 'right',
      render: (v) => <span className="text-gray-700 dark:text-gray-300">{formatCurrency(Number(v.subtotal) * 0.02)}</span>
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (v) => (
        v.liquidacionId ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Liquidada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pendiente
          </span>
        )
      )
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
      )
    }
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
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTableToolbar>
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {data.length} {data.length === 1 ? 'registro' : 'registros'}
          </span>
          <button
            type="button"
            onClick={handleExport}
            disabled={data.length === 0}
            title="Exportar a Excel"
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={data.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
