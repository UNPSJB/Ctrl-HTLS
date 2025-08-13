import { Building2 } from 'lucide-react';
import useHotelForm from '@/hooks/useHotelForm';
import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import useHotel from '@/hooks/useHotel';
import { Loading } from '@/components/modals/Loading';
import Swal from 'sweetalert2';

export default function CreateHotelFormPage() {
  const hotelForm = useHotelForm();
  const { tiposHabitaciones, categorias, loading } = useHotel();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    onSubmit,
    tiposSeleccionados,
    selectedTipo,
    setSelectedTipo,
    precioTemporal,
    setPrecioTemporal,
    handleAgregarTipoHabitacion,
    handleTipoHabitacionRemove,
    canAddTipoHabitacion,
    isSubmitting,
  } = hotelForm;

  const handleFormSubmit = (data) => {
    // Ahora los datos de ubicación están incluidos en data
    onSubmit(data);
  };

  const handleSelectChange = (field, value) => {
    setValue(field, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Registrar Nuevo Hotel</h1>
                <p className="text-blue-100">
                  Complete la información del hotel y su encargado
                </p>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {loading && <Loading />}

          {/* Content */}
          <div className="p-6 relative">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Información Básica del Hotel */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Información Básica del Hotel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre del Hotel *
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Ej: Hotel Paradise Resort"
                      disabled={loading || isSubmitting}
                      {...register('nombre', {
                        required: 'El nombre es obligatorio',
                      })}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      } ${loading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm">
                        {errors.nombre.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono *
                    </label>
                    <input
                      id="telefono"
                      type="text"
                      placeholder="Ej: +52 55 1234 5678"
                      disabled={loading || isSubmitting}
                      {...register('telefono', {
                        required: 'El teléfono es obligatorio',
                      })}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                      } ${loading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-sm">
                        {errors.telefono.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dirección *
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    placeholder="Ej: Av. Reforma 123, Col. Centro"
                    disabled={loading || isSubmitting}
                    {...register('direccion', {
                      required: 'La dirección es obligatoria',
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.direccion ? 'border-red-500' : 'border-gray-300'
                    } ${loading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Ej: contacto@hotel.com"
                    disabled={loading || isSubmitting}
                    {...register('email', {
                      required: 'El email es obligatorio',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${loading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <UbicacionSelector
                errors={errors}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              {/* Datos del Encargado */}
              <EncargadoForm
                register={register}
                errors={errors}
                watch={watch}
                loading={loading || isSubmitting}
              />

              {/* Tipos de Habitaciones */}
              <TiposHabitacionSelector
                tiposHabitaciones={tiposHabitaciones}
                tiposSeleccionados={tiposSeleccionados}
                selectedTipo={selectedTipo}
                setSelectedTipo={setSelectedTipo}
                precioTemporal={precioTemporal}
                setPrecioTemporal={setPrecioTemporal}
                onAgregar={handleAgregarTipoHabitacion}
                onRemover={handleTipoHabitacionRemove}
                canAdd={canAddTipoHabitacion}
                loading={loading || isSubmitting}
                errors={errors} // Pasamos los errores al componente
              />

              {/* Categoría */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Categoría del Hotel
                </h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría *
                  </label>
                  <select
                    {...register('categoriaId', {
                      required: 'Debe seleccionar una categoría',
                    })}
                    onChange={(e) =>
                      handleSelectChange('categoriaId', e.target.value)
                    }
                    value={watch('categoriaId') || ''}
                    disabled={loading || isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.categoriaId ? 'border-red-500' : 'border-gray-300'
                    } ${loading || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {loading
                        ? 'Cargando categorías...'
                        : 'Seleccionar categoría'}
                    </option>
                    {(categorias || []).map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.categoriaId && (
                    <p className="text-red-500 text-sm">
                      {errors.categoriaId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  disabled={loading || isSubmitting}
                  className={`flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loading || isSubmitting
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loading || isSubmitting
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }`}
                >
                  {isSubmitting ? 'Creando...' : 'Registrar Hotel y Encargado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
