import { useState } from 'react';
import { formatFecha } from '@/utils/dateUtils';
import {
  Users,
  Receipt,
  ShoppingBag
} from 'lucide-react';
import { DataTable, DataTablePagination } from '@admin-ui';

const ITEMS_PER_PAGE = 10;

/**
 * Componente de Lista para el historial de alquileres de un cliente.
 * Separa fechas, pasajeros e información de facturación en columnas independientes.
 */
export default function HistorialTable({
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
      key: 'alquilerId',
      label: 'ID',
      render: (venta) => (
        <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
          #{venta.alquilerId}
        </span>
      )
    },
    {
      key: 'fechaInicio',
      label: 'F. Inicio',
      align: 'center',
      render: (venta) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {formatFecha(venta.fechaInicio)}
        </div>
      )
    },
    {
      key: 'fechaFin',
      label: 'F. Fin',
      align: 'center',
      render: (venta) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {formatFecha(venta.fechaFin)}
        </div>
      )
    },
    {
      key: 'pasajeros',
      label: 'Pasajeros',
      align: 'center',
      render: (venta) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-300">
          <Users className="h-3.5 w-3.5 opacity-50" />
          {venta.pasajeros}
        </div>
      )
    },
    {
      key: 'importeTotal',
      label: 'Monto Total',
      align: 'right',
      render: (venta) => (
        <span className="font-bold text-gray-900 dark:text-white">
          ${venta.importeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'factura.fecha',
      label: 'Fecha Factura',
      align: 'center',
      render: (venta) => (
        <span className="text-gray-500 dark:text-gray-400">
          {venta.detalle?.factura?.fecha ? (
            <div className="flex items-center justify-center gap-1.5">
              {formatFecha(venta.detalle.factura.fecha)}
            </div>
          ) : (
            <span className="italic opacity-30">—</span>
          )}
        </span>
      )
    },
    {
      key: 'facturacion',
      label: 'Facturación',
      render: (venta) => (
        <span>
          {venta.detalle?.factura ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Receipt className="h-3.5 w-3.5" />
              Factura {venta.detalle.factura.tipoFactura}
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
        loadingMessage="Cargando historial..."
        emptyIcon={ShoppingBag}
        emptyMessage="No hay actividad registrada para este cliente."
        rowKey={(row) => row.alquilerId}
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
