import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Home, Award, Sparkles } from 'lucide-react';
import { formatCurrency } from '@utils/pricingUtils';
import { toast } from 'react-hot-toast';

export default function PagoExitoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // Si acceden a esta página sin haber pagado, los mandamos al inicio.
  if (!state || !state.facturacionInfo) {
    return <Navigate to="/" replace />;
  }

  const {
    facturacionInfo,
    clienteNombre,
    puntosGanados,
    puntosGastados,
    puntosActuales
  } = state;

  const handleDownloadPDF = () => {
    const pdfBase64 = facturacionInfo?.pdfBase64;
    if (!pdfBase64) {
      toast.error('El archivo PDF no está disponible.');
      return;
    }

    try {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const nroFactura = facturacionInfo?.numero || facturacionInfo?.nroFactura || Date.now();
      const nombreArchivo = `Factura_${nroFactura}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Factura descargada correctamente.');
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
      toast.error('Hubo un problema al generar la descarga del PDF.');
    }
  };

  const nroFactura = facturacionInfo?.factura?.numero || facturacionInfo?.numero || 'Pendiente';
  const tipoPago = facturacionInfo?.pago?.tipo_pago || facturacionInfo?.tipo_pago || 'Desconocido';
  const importeTotal = facturacionInfo?.factura?.importe_total || facturacionInfo?.importe_total || 0;

  return (
    <div className="mx-auto w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500 mt-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Header Exito */}
        <div className="flex flex-col items-center justify-center bg-green-50 px-8 py-12 text-center dark:bg-green-900/20">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-sm dark:bg-green-800/50">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            ¡Cobro Exitoso!
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-lg">
            La transacción a nombre de <span className="font-semibold text-gray-900 dark:text-gray-200">{clienteNombre || 'Cliente Consumidor Final'}</span> se ha registrado correctamente en el sistema.
          </p>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-2">
          {/* Resumen Factura */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Detalles de Facturación
            </h2>
            <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-800/30">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400">Número de Comprobante:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {nroFactura !== 'Pendiente' ? `#${nroFactura}` : nroFactura}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400">Método de Pago:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {tipoPago}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total Pagado:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(importeTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            {/* Recompensas Puntos */}
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Programa de Beneficios
              </h2>
              {puntosGanados > 0 || puntosGastados > 0 ? (
                <div className="flex items-start gap-4 rounded-xl border border-indigo-100 bg-indigo-50/80 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {puntosGanados > 0 ? <Sparkles className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                      {puntosGanados > 0 ? `¡Sumó ${puntosGanados} puntos!` : `Utilizó ${puntosGastados} puntos`}
                    </h3>
                    <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400/80">
                      Saldo actual estimado: <span className="font-semibold">{puntosActuales}</span> puntos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-400">
                  Esta transacción no generó ni consumió puntos.
                </div>
              )}
            </div>

            {/* Botones de Acciones */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleDownloadPDF}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Download className="h-5 w-5" />
                Descargar Factura
              </button>
              <button
                onClick={() => navigate('/', { replace: true })}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <Home className="h-5 w-5" />
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
