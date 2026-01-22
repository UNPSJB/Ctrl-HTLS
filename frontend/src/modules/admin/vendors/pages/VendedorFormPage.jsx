import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { toast } from 'react-hot-toast';
import { User, Save, X, Lock, MapPin, Building2, Briefcase } from 'lucide-react';
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

  const [assignedHotels, setAssignedHotels] = useState([]); // Hoteles asignados (objetos completos)
  const [initialHotels, setInitialHotels] = useState([]); // Para comparar cambios
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general, ubicacion, hoteles, seguridad, comisiones

  useEffect(() => {
    // Si estamos editando, cargamos datos del vendedor
    if (isEditing) {
      fetchVendedor();
    }
  }, [id]);

  const fetchVendedor = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`/vendedor/${id}`);
      const data = response.data;

      const userHotels = data.hotelesPermitidos ? data.hotelesPermitidos : [];

      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        email: data.email || '',
        telefono: data.telefono || '',
        tipoDocumento: data.tipoDocumento || 'dni',
        numeroDocumento: data.numeroDocumento || '',
        direccion: data.direccion || '',
        password: '',
        rol: 'vendedor',
      });

      setAssignedHotels(userHotels);
      setInitialHotels(userHotels);

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

  const handleRemoveHotel = (hotelId) => {
    if (window.confirm('¿Seguro que desea quitar el acceso a este hotel? Esta acción se aplicará al guardar.')) {
      setAssignedHotels(prev => prev.filter(h => h.id !== hotelId));
    }
  };

  const handleDocumentoChange = (e) => {
    const { value } = e.target;
    const tipo = formData.tipoDocumento;
    let procesado = value.replace(tipo === 'pasaporte' ? /[^a-zA-Z0-9]/g : /\D/g, '');
    if (tipo === 'pasaporte') procesado = procesado.toUpperCase();

    setFormData((prev) => ({ ...prev, numeroDocumento: procesado }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
  };

  const handleTipoChange = (e) => {
    setFormData((prev) => ({ ...prev, tipoDocumento: e.target.value, numeroDocumento: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.numeroDocumento ||
      !formData.email ||
      (!isEditing && !formData.password) ||
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
    // Quitamos hotelIds del payload porque no es aceptado por el endpoint de updateEmpleado
    delete payload.hotelIds;

    if (isEditing && !payload.password) delete payload.password;

    try {
      let vendedorId = id;

      if (isEditing) {
        await axiosInstance.put(`/empleado/${id}`, payload);
        toast.success('Datos del vendedor actualizados');
      } else {
        const res = await axiosInstance.post('/empleado', payload);
        vendedorId = res.data.id;
        toast.success('Vendedor registrado');
      }

      // Manejo de desasignación de hoteles (Solo eliminaciones)
      if (vendedorId && isEditing) {
        const currentIds = assignedHotels.map(h => h.id);
        const removedHotels = initialHotels.filter(h => !currentIds.includes(h.id));

        if (removedHotels.length > 0) {
          await Promise.all(removedHotels.map(h =>
            axiosInstance.post('/hotel/desasignar-empleado', { hotelId: h.id, vendedorId })
          ));
          toast.success('Se quitaron los permisos de hoteles seleccionados');
        }
      }

      navigate('/admin/vendedores');
    } catch (error) {
      console.error(error);
      const mensaje = error.response?.data?.error || 'Error al guardar vendedor';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin/vendedores');

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

  if (loadingData) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Encabezado Tipo Perfil */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? `${formData.nombre} ${formData.apellido}` : 'Nuevo Vendedor'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Briefcase className="h-4 w-4" />
            <span>Rol: Vendedor</span>
            {isEditing && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Activo</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar de Navegación Local */}
        <div className="lg:col-span-1">
          <nav className="flex flex-col space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <button type="button" onClick={() => setActiveTab('general')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === 'general' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <User className="h-4 w-4" /> Información Personal
            </button>
            <button type="button" onClick={() => setActiveTab('ubicacion')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === 'ubicacion' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <MapPin className="h-4 w-4" /> Ubicación y Contacto
            </button>
            <button type="button" onClick={() => setActiveTab('hoteles')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === 'hoteles' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Building2 className="h-4 w-4" /> Acceso a Hoteles
            </button>
            <button type="button" onClick={() => setActiveTab('seguridad')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === 'seguridad' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Lock className="h-4 w-4" /> Seguridad
            </button>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">

            {/* --- Pestaña: General --- */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className={labelClass}>Nombre *</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="apellido" className={labelClass}>Apellido *</label>
                    <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="tipoDocumento" className={labelClass}>Tipo Documento *</label>
                    <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleTipoChange} className={inputClass}>
                      {tiposDocumento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="numeroDocumento" className={labelClass}>Número Documento *</label>
                    <input type="text" id="numeroDocumento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleDocumentoChange} className={inputClass} maxLength={15} />
                  </div>
                </div>
              </div>
            )}

            {/* --- Pestaña: Ubicación --- */}
            {activeTab === 'ubicacion' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación y Contacto</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClass}>Email *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="telefono" className={labelClass}>Teléfono</label>
                    <input type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleNumericChange} className={inputClass} />
                  </div>
                  <div className="col-span-full">
                    <label htmlFor="direccion" className={labelClass}>Dirección *</label>
                    <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>País *</label>
                    <select value={paisId} onChange={(e) => handlePaisChange(e.target.value)} className={inputClass}>
                      <option value="">Seleccione país</option>
                      {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Provincia *</label>
                    <select value={provinciaId} onChange={(e) => handleProvinciaChange(e.target.value)} className={inputClass} disabled={isProvinciasDisabled}>
                      <option value="">Seleccione provincia</option>
                      {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ciudad *</label>
                    <select value={ciudadId} onChange={(e) => handleCiudadChange(e.target.value)} className={inputClass} disabled={isCiudadesDisabled}>
                      <option value="">Seleccione ciudad</option>
                      {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- Pestaña: Hoteles --- */}
            {activeTab === 'hoteles' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hoteles Asignados</h3>
                <p className="text-sm text-gray-500">
                  Gestione los hoteles a los que este vendedor tiene acceso.
                  <br />
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {assignedHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-blue-900 dark:text-blue-300">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{hotel.nombre}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHotel(hotel.id)}
                        className="rounded-full p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
                        title="Quitar acceso"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {assignedHotels.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600">
                      <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>Este vendedor no tiene hoteles asignados.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- Pestaña: Seguridad --- */}
            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad de la Cuenta</h3>
                <div className="max-w-md">
                  <label htmlFor="password" className={labelClass}>{isEditing ? 'Nueva Contraseña' : 'Contraseña *'}</label>
                  <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                  {isEditing && <p className="mt-1 text-xs text-gray-500">Deje el campo vacío para mantener la contraseña actual.</p>}
                </div>
              </div>
            )}

            {/* Footer de Acciones (Siempre visible) */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
              <button type="button" onClick={handleCancel} disabled={loading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Guardando...' : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default VendedorFormPage;
