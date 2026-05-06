import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Receipt,
  ShoppingBag,
  CreditCard,
  Building2,
  CalendarDays,
  Eye
} from 'lucide-react';
import { DataTable, DataTablePagination } from '@admin-ui';
import TableButton from '@admin-ui/TableButton';
import { capitalizeFirst, capitalizeWords } from '@/utils/stringUtils';

const ITEMS_PER_PAGE = 10;

/**
 * Componente de Lista para las ventas globales de la empresa.
 * Muestra información sobre el hotel, fecha, vendedor, cliente, montos y facturación.
 */
export default function VentasGlobalTable({
  data = [],
  loading = false
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const navigate = useNavigate();
  const location = useLocation();

  const handleView = (id) => {
    navigate(`/admin/ventas/${id}`, { state: { from: location.pathname } });
  };

  const columns = [
    {
      key: 'hotel',
      label: 'Hotel',
      render: (venta) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
            {venta.hotel
              ? capitalizeWords(venta.hotel)
              : <span className="italic text-gray-400">Desconocido</span>}
          </div>
        </div>
      )
    },
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
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (venta) => (
        <div className="flex justify-end gap-2">
          <TableButton
            variant="view"
            icon={Eye}
            onClick={() => handleView(venta.id)}
            aria-label="Ver detalles de venta"
            title="Ver Detalle"
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
        loading={loading}
        loadingMessage="Buscando ventas globales..."
        emptyIcon={Receipt}
        emptyMessage="No se encontraron ventas con los criterios especificados."
        rowKey={(row, index) => row.id || index}
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
