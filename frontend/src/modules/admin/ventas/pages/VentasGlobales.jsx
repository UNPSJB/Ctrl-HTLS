import { useState, useEffect } from 'react';
import { toISODate, getNextDay } from '@/utils/dateUtils';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FormField, Input, TextInput } from '@/components/ui/form';
import NumberInput from '@/components/ui/form/NumberInput';
import VentasGlobalTable from '../components/VentasGlobalTable';
import AppButton from '@/components/ui/AppButton';
import ListHeader from '@/modules/admin/shared/components/ui/ListHeader';
import { buscarVentas } from '@/api/ventas/ventasService';

// Límites globales del selector de fechas
const FECHA_MIN = '2000-01-01';
const FECHA_MAX = '2100-12-31';


export default function VentasGlobales() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState(null);

  // Estados del formulario con los mismos nombres que espera el backend
  const [filtros, setFiltros] = useState({
    fechaInicio: searchParams.get('fechaInicio') || '',
    fechaFin: searchParams.get('fechaFin') || '',
    nombreHotel: '',
    dniCliente: '',
    dniVendedor: '',
  });

  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) {
      performSearch();
    }
  }, []); // Solo en el montaje

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await buscarVentas(filtros);
      setVentas(resultado);
    } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        'Error al buscar ventas. Intente nuevamente.';
      setError(mensaje);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await performSearch();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFiltros((prev) => {
      const siguiente = { ...prev, [name]: value };

      // Si se cambió fechaInicio y fechaFin ya no es válida (≤ fechaInicio), se resetea
      if (name === 'fechaInicio' && prev.fechaFin && value >= prev.fechaFin) {
        siguiente.fechaFin = '';
      }

      return siguiente;
    });
  };

  return (
    <div className="animate-in fade-in flex h-full flex-col gap-6 overflow-hidden duration-500">
      {/* Encabezado de la página */}
      <ListHeader
        title="Ventas"
        description="Búsqueda y visualización general del registro de ventas."
      />

      {/* Formulario de Búsqueda */}
      <div className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <FormField label="Fecha Inicio">
              <Input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleChange}
                min={FECHA_MIN}
                max={FECHA_MAX}
              />
            </FormField>

            <FormField label="Fecha Fin">
              <Input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleChange}
                min={getNextDay(filtros.fechaInicio, FECHA_MIN)}
                max={FECHA_MAX}
              />
            </FormField>

            <FormField label="Hotel (Nombre)">
              <TextInput
                name="nombreHotel"
                placeholder="Ej. Paraíso..."
                value={filtros.nombreHotel}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Doc. Cliente">
              <NumberInput
                name="dniCliente"
                placeholder="Ej. 12345678"
                value={filtros.dniCliente}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Doc. Vendedor">
              <NumberInput
                name="dniVendedor"
                placeholder="Ej. 87654321"
                value={filtros.dniVendedor}
                onChange={handleChange}
              />
            </FormField>
          </div>

          {/* Mensaje de error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-2 flex justify-end border-t border-gray-100 pt-2 dark:border-gray-700">
            <AppButton
              type="submit"
              icon={Search}
              isLoading={loading}
              className="min-w-[140px]"
            >
              Buscar Ventas
            </AppButton>
          </div>
        </form>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="flex min-h-0 flex-grow flex-col">
        <VentasGlobalTable data={ventas} loading={loading} />
      </div>
    </div>
  );
}
