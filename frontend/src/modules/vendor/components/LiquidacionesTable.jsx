import { useState } from 'react';
import { CheckCircle2, Clock, Receipt, Download } from 'lucide-react';
import { formatFecha, parseDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { downloadBase64PDF } from '@/utils/pdfUtils';

const ITEMS_PER_PAGE = 10;

/**
 * Tabla estandarizada para mostrar liquidaciones de un vendedor
 */
export default function LiquidacionesTable({ data = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadRecibo = async (liquidacionId) => {
    try {
      setDownloadingId(liquidacionId);
      const response = await axiosInstance.get(`/liquidaciones/${liquidacionId}/ver-recibo`, {
        responseType: 'blob'
      });
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

  // Ordenar por fecha de emisión descendente
  const sortedData = [...data].sort((a, b) => parseDate(b.fechaEmision) - parseDate(a.fechaEmision));

  const currentItems = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'numero',
      label: 'Referencia',
      render: (l) => <span className="font-mono text-xs text-gray-500">#{l.numero}</span>
    },
    {
      key: 'fechaEmision',
      label: 'Fecha Emisión',
      render: (l) => <span className="text-gray-700 dark:text-gray-300">{formatFecha(l.fechaEmision)}</span>
    },
    {
      key: 'fechaPago',
      label: 'Fecha Pago',
      render: (l) => <span className="text-gray-700 dark:text-gray-300">{formatFecha(l.fechaPago)}</span>
    },
    {
      key: 'total',
      label: 'Total Comisión',
      align: 'right',
      render: (l) => <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(l.total)}</span>
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (l) => (
        l.fechaPago ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Cobrada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Por Cobrar
          </span>
        )
      )
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
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTable
        columns={columns}
        data={currentItems}
        emptyIcon={Receipt}
        emptyMessage="No hay liquidaciones registradas."
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
