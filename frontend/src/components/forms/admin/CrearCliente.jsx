import { useState } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Save, X } from 'lucide-react';

const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'le', nombre: 'LE' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
];

const CrearCliente = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoDocumento: 'dni',
    numeroDocumento: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler para el documento: se comporta distinto según el tipo seleccionado
  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    const tipo = formData.tipoDocumento;

    let procesado = value;

    // Si es DNI, LI o LE, forzamos solo números
    if (['dni', 'li', 'le'].includes(tipo)) {
      procesado = value.replace(/\D/g, '');
    } else {
      // Si es Pasaporte, permitimos letras y números, pero quitamos símbolos raros y espacios
      // También lo pasamos a mayúsculas por convención
      procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      numeroDocumento: procesado,
    }));
  };

  // Handler solo para teléfono (siempre numérico)
  const handleTelefonoChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      telefono: numericValue,
    }));
  };

  // Si el usuario cambia el tipo de documento, limpiamos el número para evitar inconsistencias
  const handleTipoChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: value,
      numeroDocumento: '', // Reseteamos el número al cambiar el tipo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.numeroDocumento ||
      !formData.email
    ) {
      toast.error('Por favor complete todos los campos obligatorios');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/cliente', formData);
      toast.success('Cliente registrado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        tipoDocumento: 'dni',
        numeroDocumento: '',
      });
    } catch (error) {
      console.error(error);
      const mensaje =
        error.response?.data?.error || 'Ocurrió un error al crear el cliente';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      tipoDocumento: 'dni',
      numeroDocumento: '',
    });
    toast('Formulario limpiado', { icon: '🧹' });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all';

  const labelClass =
    'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Registrar Nuevo Cliente
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingrese los datos personales para dar de alta un cliente.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="nombre" className={labelClass}>
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="apellido" className={labelClass}>
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="tipoDocumento" className={labelClass}>
                Tipo de Documento *
              </label>
              <div className="relative">
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleTipoChange} // Usamos el handler especial para resetear
                  className={`${inputClass} appearance-none`}
                >
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="numeroDocumento" className={labelClass}>
                Número de Documento *
              </label>
              <input
                type="text"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleDocumentoChange} // Handler con lógica según tipo
                placeholder={
                  formData.tipoDocumento === 'pasaporte'
                    ? 'Ej: A1234567'
                    : 'Ej: 12345678'
                }
                className={inputClass}
                maxLength={15}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@ejemplo.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="telefono" className={labelClass}>
                Teléfono
              </label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="Ej: 1123456789"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
              Limpiar Formulario
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCliente;
