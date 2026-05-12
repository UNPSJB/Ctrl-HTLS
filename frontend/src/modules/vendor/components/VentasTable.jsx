import { useState } from 'react';
import { CheckCircle2, Clock, History, FileText } from 'lucide-react';
import { formatFecha } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/pricingUtils';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { downloadBase64PDF } from '@/utils/pdfUtils';

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

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
