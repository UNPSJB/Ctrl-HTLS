import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Receipt,
  Building2,
  User,
  Briefcase,
  CalendarDays,
  CreditCard,
  Hash,
  Users,
  BedDouble,
  Palmtree,
  DollarSign
} from 'lucide-react';
import { PageHeader } from '@admin-ui';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { capitalizeWords, capitalizeFirst } from '@/utils/stringUtils';

// Datos de prueba simulados (Mock Data) para una venta detallada
const MOCK_VENTA_DETALLE = {
  id: "1",
  involucrados: {
    hotel: "Hotel Paraíso Central",
    cliente: "Ana López",
    vendedor: "Carlos Martínez"
  },
  factura: {
    numero: "0001-0000456",
    fecha: "2023-11-15T14:30:00Z",
    tipo: "A",
    montoTotal: 1500.50,
    metodoPago: "tarjeta"
  },
  alquiler: {
    fechaInicio: "2023-12-01T14:00:00Z",
    fechaFin: "2023-12-10T10:00:00Z",
    pasajeros: 4
  },
  habitaciones: [
    { numero: "101", tipo: "Doble Superior" },
    { numero: "102", tipo: "Doble Estándar" }
  ],
  paquetes: [
    {
      nombre: "Paquete Fin de Semana Romántico",
      fechaInicio: "2023-12-01T14:00:00Z",
      fechaFin: "2023-12-03T10:00:00Z",
      habitaciones: [
        { numero: "205", tipo: "Suite Presidencial" },
        { numero: "206", tipo: "Suite Presidencial" }
      ]
    },
    {
      nombre: "Paquete Aventura Selva",
      fechaInicio: "2023-12-05T14:00:00Z",
      fechaFin: "2023-12-08T10:00:00Z",
      habitaciones: [
        { numero: "301", tipo: "Triple Estándar" }
      ]
    }
  ]
};

export default function VentaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [venta, setVenta] = useState(null);

  const backUrl = location.state?.from || '/admin/ventas';

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    const timer = setTimeout(() => {
      setVenta({ ...MOCK_VENTA_DETALLE, id });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading || !venta) {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="flex-shrink-0">
          <PageHeader
            title="Cargando Venta..."
            description="Recuperando la información del registro"
            backTo={backUrl}
            icon={Receipt}
            loading={true}
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <InnerLoading message="Obteniendo detalles de la venta..." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex-shrink-0">
        <PageHeader
          title={`Detalle de Venta #${venta.id}`}
          description={`Registrada el ${new Date(venta.factura.fecha).toLocaleDateString()}`}
          backTo={backUrl}
          icon={Receipt}
        />
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <div className="flex flex-col gap-6 pb-6">

          {/* Fila Superior: Involucrados y Facturación */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Tarjeta: Involucrados */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Involucrados en la Operación
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hotel</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(venta.involucrados.hotel)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(venta.involucrados.cliente)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendedor</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{capitalizeWords(venta.involucrados.vendedor)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta: Facturación */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-500" />
                Detalles de Facturación
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Hash className="h-3.5 w-3.5" /> Número
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {venta.factura.tipo ? `Factura ${venta.factura.tipo} - ${venta.factura.numero}` : 'Sin comprobante'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <CalendarDays className="h-3.5 w-3.5" /> Fecha Emisión
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(venta.factura.fecha).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <CreditCard className="h-3.5 w-3.5" /> Método de Pago
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {capitalizeFirst(venta.factura.metodoPago)}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500 mb-1">
                    <DollarSign className="h-3.5 w-3.5" /> Monto Total
                  </p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    ${Number(venta.factura.montoTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fila del Medio: Información de Alquiler General */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Información del Alquiler
            </h3>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingreso (Check-in)</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(venta.alquiler.fechaInicio).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Salida (Check-out)</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(venta.alquiler.fechaFin).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Huéspedes</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  {venta.alquiler.pasajeros} Pasajeros
                </p>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Habitaciones y Paquetes */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Listado de Habitaciones Sueltas */}
            {venta.habitaciones && venta.habitaciones.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                <div className="border-b border-gray-100 dark:border-gray-700/50 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-rose-500" />
                    Habitaciones Alquiladas ({venta.habitaciones.length})
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {venta.habitaciones.map((hab, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-sm">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{hab.numero}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{hab.tipo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listado de Paquetes */}
            {venta.paquetes && venta.paquetes.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                <div className="border-b border-gray-100 dark:border-gray-700/50 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Palmtree className="h-5 w-5 text-emerald-500" />
                    Paquetes Turísticos ({venta.paquetes.length})
                  </h3>
                </div>
                <div className="p-4 flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
                  {venta.paquetes.map((paquete, idx) => (
                    <div key={idx} className={`py-4 ${idx !== venta.paquetes.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''} first:pt-0 last:pb-0`}>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        {paquete.nombre}
                      </h4>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 opacity-70" />
                          {new Date(paquete.fechaInicio).toLocaleDateString()} — {new Date(paquete.fechaFin).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700 p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Habitaciones Incluidas
                        </p>
                        <div className="flex flex-col gap-2">
                          {paquete.habitaciones.map((hab, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 text-sm">
                              <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[30px]">
                                #{hab.numero}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">— {hab.tipo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
