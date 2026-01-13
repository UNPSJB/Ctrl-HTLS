import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Save, X, Lock, MapPin, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useUbicacion from '@/hooks/useUbicacion';

const tiposDocumento = [
  { id: 'dni', nombre: 'DNI' },
  { id: 'li', nombre: 'LI' },
  { id: 'le', nombre: 'LE' },
  { id: 'pasaporte', nombre: 'Pasaporte' },
];

const VendedorFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Hook de ubicación personalizado
  const {
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    isProvinciasDisabled,
    isCiudadesDisabled,
    resetUbicacion,
    setInitialUbicacion,
  } = useUbicacion();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoDocumento: 'dni',
    numeroDocumento: '',
    direccion: '',
    password: '',
    rol: 'vendedor',
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Efecto para cargar datos si estamos editando
  useEffect(() => {
    if (isEditing) {
      fetchVendedor();
    }
  }, [id]);

  const fetchVendedor = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      const data = response.data;

      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        email: data.email || '',
        telefono: data.telefono || '',
        tipoDocumento: data.tipoDocumento || 'dni',
        numeroDocumento: data.numeroDocumento || '',
        direccion: data.direccion || '',
        password: '', // No mostramos la contraseña al editar
        rol: 'vendedor',
      });

      // Precargar ubicación si está disponible en la respuesta
      if (data.ubicacion) {
        setInitialUbicacion(
          data.ubicacion.paisId,
          data.ubicacion.provinciaId,
          data.ubicacion.ciudadId
        );
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos del vendedor');
      navigate('/admin/vendedores');
    } finally {
      setLoadingData(false);
    }
  };

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

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleTipoChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: value,
      numeroDocumento: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validación básica
    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.numeroDocumento ||
      !formData.email ||
      (!isEditing && !formData.password) || // Password obligatorio solo al crear
      !formData.direccion ||
      !ciudadId
    ) {
      toast.error('Por favor complete todos los campos obligatorios');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      ciudadId: ciudadId,
    };

    // Si editamos y el password está vacío, lo quitamos para no sobreescribirlo con vacío
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      if (isEditing) {
        await axiosInstance.put(`/empleado/${id}`, payload);
        toast.success('Vendedor actualizado exitosamente');
      } else {
        await axiosInstance.post('/empleado', payload);
        toast.success('Vendedor registrado exitosamente');
      }
      navigate('/admin/vendedores');
    } catch (error) {
      console.error(error);
      const mensaje = isEditing
        ? (error.response?.data?.error || 'Error al actualizar vendedor')
        : (error.response?.data?.error || 'Error al crear vendedor');
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/vendedores');
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all';

  const labelClass =
    'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

  if (loadingData) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Editar Vendedor' : 'Registrar Nuevo Vendedor'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing
                ? 'Actualice los datos del vendedor seleccionado.'
                : 'Complete los datos para dar de alta un empleado con acceso al sistema.'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* --- Sección Datos Personales --- */}
            <div className="col-span-full flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
              <UserPlus className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Datos Personales
              </h3>
            </div>

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
                placeholder="Ej: María"
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
                placeholder="Ej: López"
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
                  onChange={handleTipoChange}
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
                onChange={handleDocumentoChange}
                placeholder={
                  formData.tipoDocumento === 'pasaporte'
                    ? 'A1234567'
                    : '12345678'
                }
                className={inputClass}
                maxLength={15}
              />
            </div>

            {/* --- Sección Contacto y Ubicación --- */}
            <div className="col-span-full mt-2 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Contacto y Ubicación
              </h3>
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
                placeholder="vendedor@empresa.com"
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
                onChange={handleNumericChange}
                placeholder="1123456789"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="direccion" className={labelClass}>
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Corrientes 1234"
                className={inputClass}
              />
            </div>

            {/* Selectores de Ubicación (Cascada) */}
            <div className="contents">
              <div>
                <label htmlFor="pais" className={labelClass}>País *</label>
                <select
                  id="pais"
                  value={paisId}
                  onChange={(e) => handlePaisChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccione país</option>
                  {paises.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="provincia" className={labelClass}>Provincia *</label>
                <select
                  id="provincia"
                  value={provinciaId}
                  onChange={(e) => handleProvinciaChange(e.target.value)}
                  className={inputClass}
                  disabled={isProvinciasDisabled}
                >
                  <option value="">Seleccione provincia</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ciudad" className={labelClass}>Ciudad *</label>
                <select
                  id="ciudad"
                  value={ciudadId}
                  onChange={(e) => handleCiudadChange(e.target.value)}
                  className={inputClass}
                  disabled={isCiudadesDisabled}
                >
                  <option value="">Seleccione ciudad</option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>


            {/* --- Sección Seguridad --- */}
            <div className="col-span-full mt-2 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
              <Lock className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Seguridad
              </h3>
            </div>

            <div className="col-span-full md:col-span-1">
              <label htmlFor="password" className={labelClass}>
                {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
              {isEditing && <p className="text-xs text-gray-500 mt-1">Dejar en blanco para mantener la actual.</p>}

            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
              Cancelar
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
                  {isEditing ? 'Actualizar Vendedor' : 'Guardar Vendedor'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendedorFormPage;
