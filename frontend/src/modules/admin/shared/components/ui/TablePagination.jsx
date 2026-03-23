import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TablePagination({
  currentPage,
  totalItems,
  itemsPerPage = 100,
  onPageChange,
  disabled = false,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando <span className="font-medium">
          {totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}
        </span> a <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span> de <span className="font-medium">{totalItems}</span> resultados
      </div>
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1 || disabled}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
          title="Página Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages || totalPages === 0 || disabled}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
          title="Página Siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
