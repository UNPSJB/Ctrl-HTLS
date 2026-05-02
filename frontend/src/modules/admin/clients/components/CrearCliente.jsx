import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Save, X } from 'lucide-react';
import { 
  FormField, 
  TextInput, 
  SelectInput, 
  EmailInput, 
  TelInput 
} from '@form';

import { TIPOS_DOCUMENTO } from '@/utils/constants';

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

  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    const tipo = formData.tipoDocumento;

    let procesado = value;

    if (['dni', 'li', 'le'].includes(tipo)) {
      procesado = value.replace(/\D/g, '');
    } else {

      procesado = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      numeroDocumento: procesado,
    }));
  };

  const handleTelefonoChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      telefono: numericValue,
    }));
  };

  const handleTipoChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: value,
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
            <FormField label="Nombre" required>
              <TextInput
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
              />
            </FormField>

            <FormField label="Apellido" required>
              <TextInput
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej: Pérez"
              />
            </FormField>

            <FormField label="Tipo de Documento" required>
              <SelectInput
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleTipoChange}
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Número de Documento" required>
              <TextInput
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleDocumentoChange}
                placeholder={
                  formData.tipoDocumento === 'pasaporte'
                    ? 'Ej: A1234567'
                    : 'Ej: 12345678'
                }
                maxLength={15}
              />
            </FormField>

            <FormField label="Correo Electrónico" required>
              <EmailInput
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@ejemplo.com"
              />
            </FormField>

            <FormField label="Teléfono">
              <TelInput
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="Ej: 1123456789"
              />
            </FormField>
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
