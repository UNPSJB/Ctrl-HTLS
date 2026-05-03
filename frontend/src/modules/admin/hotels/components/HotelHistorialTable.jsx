import { useState } from 'react';
import {
  Users,
  Receipt,
  ShoppingBag,
  CreditCard,
  Building2,
  CalendarDays
} from 'lucide-react';
import { DataTable, DataTablePagination } from '@admin-ui';
import { capitalizeFirst, capitalizeWords } from '@/utils/stringUtils';

const ITEMS_PER_PAGE = 10;

/**
 * Componente de Lista para el historial de ventas de un hotel.
 * Muestra información sobre la fecha, vendedor, cliente, montos y facturación.
 */
export default function HotelHistorialTable({
  data = [],
  loading = false
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: 'fechaVenta',
      label: 'Fecha Venta',
      align: 'center',
      render: (venta) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : <span className="italic opacity-30">—</span>}
        </div>
      )
    },
    {
      key: 'vendedor',
      label: 'Vendedor',
      render: (venta) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {venta.vendedor
            ? capitalizeWords(venta.vendedor)
            : <span className="italic text-gray-400">Desconocido</span>}
        </div>
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (venta) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {venta.cliente
            ? capitalizeWords(venta.cliente)
            : <span className="italic text-gray-400">Desconocido</span>}
        </div>
      )
    },
    {
      key: 'importeTotal',
      label: 'Monto Total',
      align: 'right',
      render: (venta) => (
        <span className="font-bold text-gray-900 dark:text-white">
          ${venta.monto ? Number(venta.monto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
        </span>
      )
    },
    {
      key: 'metodoPago',
      label: 'Método de Pago',
      align: 'center',
      render: (venta) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
          {venta.metodoPago ? capitalizeFirst(venta.metodoPago) : <span className="italic text-gray-400">—</span>}
        </span>
      )
    },
    {
      key: 'facturacion',
      label: 'Facturación',
      render: (venta) => (
        <span>
          {venta.tipoFactura ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Receipt className="h-3.5 w-3.5" />
              Factura {venta.tipoFactura}
              {venta.numeroFactura ? ` - Nº ${venta.numeroFactura}` : ''}
            </span>
          ) : (
            <span className="text-xs italic text-gray-400 dark:text-gray-500">Sin comprobante</span>
          )}
        </span>
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <DataTable
        columns={columns}
        data={currentItems}
        loading={loading}
        loadingMessage="Cargando historial del hotel..."
        emptyIcon={Building2}
        emptyMessage="No hay actividad registrada para este hotel."
        rowKey={(row, index) => index}
      />

      <DataTablePagination
        currentPage={currentPage}
        totalItems={data.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  );
}
