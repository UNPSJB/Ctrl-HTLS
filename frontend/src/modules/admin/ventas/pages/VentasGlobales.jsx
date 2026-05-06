import { useState } from 'react';
import { Search } from 'lucide-react';
import { FormField, Input, TextInput } from '@/components/ui/form';
import NumberInput from '@/components/ui/form/NumberInput';
import VentasGlobalTable from '../components/VentasGlobalTable';
import AppButton from '@/components/ui/AppButton';
import ListHeader from '@/modules/admin/shared/components/ui/ListHeader';

// Datos de prueba simulados (Mock Data) para probar visualmente la tabla
const MOCK_DATA = [
  {
    id: 1,
    hotel: "Hotel Paraíso Central",
    fechaVenta: "2023-11-15T14:30:00Z",
    vendedor: "Carlos Martínez",
    cliente: "Ana López",
    monto: 1500.50,
    metodoPago: "tarjeta",
    tipoFactura: "A",
    numeroFactura: "0001-0000456"
  },
  {
    id: 2,
    hotel: "Resort Vista del Mar",
    fechaVenta: "2023-11-16T10:15:00Z",
    vendedor: "Lucía Gómez",
    cliente: "Marcos Ruiz",
    monto: 850.00,
    metodoPago: "efectivo",
    tipoFactura: "B",
    numeroFactura: "0002-0000123"
  },
  {
    id: 3,
    hotel: "Cabañas El Bosque",
    fechaVenta: "2023-11-16T16:45:00Z",
    vendedor: "Carlos Martínez",
    cliente: "Sofía Herrero",
    monto: 450.00,
    metodoPago: "mixto",
    tipoFactura: null,
    numeroFactura: null
  }
];

export default function VentasGlobales() {
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState([]); // Inicialmente vacío

  // Estados del formulario
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    hotel: '',
    clienteDoc: '',
    vendedorDoc: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simular un retardo de red de 1 segundo y luego cargar el mock data
    setTimeout(() => {
      setVentas(MOCK_DATA);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden animate-in fade-in duration-500">
      {/* Encabezado de la página */}
      <ListHeader
        title="Ventas"
        description="Búsqueda y visualización general del registro de ventas."
      />

      {/* Formulario de Búsqueda */}
      <div className="flex-shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormField label="Fecha Inicio" required>
              <Input
                type="date"
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Fecha Fin" required>
              <Input
                type="date"
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Hotel (Nombre)">
              <TextInput
                name="hotel"
                placeholder="Ej. Paraíso..."
                value={filtros.hotel}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Doc. Cliente">
              <NumberInput
                name="clienteDoc"
                placeholder="Ej. 12345678"
                value={filtros.clienteDoc}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Doc. Vendedor">
              <NumberInput
                name="vendedorDoc"
                placeholder="Ej. 87654321"
                value={filtros.vendedorDoc}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
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
      <div className="flex-grow flex flex-col min-h-0">
        <VentasGlobalTable data={ventas} loading={loading} />
      </div>
    </div>
  );
}
