import { useState } from 'react';
import {
  Calendar,
  Users,
  Receipt,
  ShoppingBag,
  FileText
} from 'lucide-react';
import TablePagination from '@admin-ui/TablePagination';
import { InnerLoading } from '@/components/ui/InnerLoading';

const ITEMS_PER_PAGE = 10;

/**
 * Componente de Lista para el historial de alquileres de un cliente.
 * Separa fechas, pasajeros e información de facturación en columnas independientes.
 */
export default function ClienteHistorialList({
  data = [],
  loading = false
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentItems = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-gray-800/50">
          <InnerLoading message="Cargando historial..." />
        </div>
      )}

      {/* área de tabla */}
      <div className="relative flex flex-col flex-grow overflow-hidden">
        
        {/* Encabezado Fijo */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-700/30">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 w-[8%]">ID</th>
                <th className="px-6 py-4 text-center w-[15%]">F. Inicio</th>
                <th className="px-6 py-4 text-center w-[15%]">F. Fin</th>
                <th className="px-6 py-4 text-center w-[12%]">Pasajeros</th>
                <th className="px-6 py-4 text-right w-[15%]">Monto Total</th>
                <th className="px-6 py-4 text-center w-[15%]">Fecha Factura</th>
                <th className="px-6 py-4 w-[20%]">Facturación</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Cuerpo desplazable */}
        <div className="flex-grow overflow-y-auto">
          {data.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <ShoppingBag className="h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm">No hay actividad registrada para este cliente.</p>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {currentItems.map((venta) => (
                  <tr
                    key={venta.alquilerId}
                    className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-gray-400 dark:text-gray-500 w-[8%]">
                      #{venta.alquilerId}
                    </td>

                    {/* Fecha Inicio */}
                    <td className="px-6 py-3 text-center w-[15%]">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(venta.fechaInicio).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Fecha Fin */}
                    <td className="px-6 py-3 text-center w-[15%]">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(venta.fechaFin).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Pasajeros */}
                    <td className="px-6 py-3 text-center w-[12%]">
                      <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Users className="h-3.5 w-3.5 opacity-50" />
                        {venta.pasajeros}
                      </div>
                    </td>

                    {/* Importe Total */}
                    <td className="px-6 py-3 text-right w-[15%]">
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${venta.importeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Fecha Factura */}
                    <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400 w-[15%]">
                      {venta.detalle?.factura?.fecha ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {new Date(venta.detalle.factura.fecha).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="italic opacity-30">—</span>
                      )}
                    </td>

                    {/* Facturación (Tipo) */}
                    <td className="px-6 py-3 w-[20%]">
                      {venta.detalle?.factura ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Receipt className="h-3.5 w-3.5" />
                          Factura {venta.detalle.factura.tipoFactura}
                        </span>
                      ) : (
                        <span className="text-xs italic text-gray-400 dark:text-gray-500">Sin comprobante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación */}
      <TablePagination
        currentPage={currentPage}
        totalItems={data.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        disabled={loading}
      />
    </div>
  );
}
