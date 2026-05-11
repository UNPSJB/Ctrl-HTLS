import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ServiciosCategoriaViewer({ categoriaId }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!categoriaId) {
      setServicios([]);
      setError(false);
      return;
    }

    let isMounted = true;

    const fetchServicios = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axiosInstance.get(
          `/categoria/${categoriaId}/servicios`
        );
        if (isMounted) {
          setServicios(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error al cargar servicios de la categoría', err);
          setError(true);
          setServicios([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServicios();

    return () => {
      isMounted = false;
    };
  }, [categoriaId]);

  return (
    <div className="animate-in fade-in col-span-1 mt-4 duration-300 md:col-span-2">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Servicios Incluidos en la Categoría
      </label>
      <div className="bg-gray-50 pt-2 dark:bg-gray-800/50">
        {!categoriaId ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Seleccioná una categoría para visualizar los servicios que se incluirán por defecto.
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            Cargando servicios correspondientes...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 dark:text-red-400">
            Ocurrió un error al cargar los servicios.
          </div>
        ) : servicios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {servicios.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-all hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {s.nombre}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Esta categoría no tiene servicios asociados.
          </div>
        )}
      </div>
    </div>
  );
}
