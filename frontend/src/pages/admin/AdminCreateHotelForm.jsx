import { Building2 } from 'lucide-react';
import useHotelForm from '@/hooks/useHotelForm';
import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import useHotel from '@/hooks/useHotel';
import { Loading } from '@/components/ui/Loading';

export default function AdminCreateHotelForm() {
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

  const handleFormSubmit = (data) => onSubmit(data);
  const handleSelectChange = (field, value) => setValue(field, value);

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center gap-3 bg-blue-600 p-6 text-white dark:bg-blue-700">
            <Building2 className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Registrar Nuevo Hotel</h1>
              <p className="text-sm text-blue-100">
                Complete la información del hotel y su encargado
              </p>
            </div>
          </div>

          {loading && <Loading />}

          <div className="p-6">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Información Básica */}
              <section className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      } ${loading || isSubmitting ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    />
                    {errors.nombre && (
                      <p className="text-sm text-red-500">
                        {errors.nombre.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                      } ${loading || isSubmitting ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    />
                    {errors.telefono && (
                      <p className="text-sm text-red-500">
                        {errors.telefono.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.direccion ? 'border-red-500' : 'border-gray-300'
                    } ${loading || isSubmitting ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-500">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${loading || isSubmitting ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </section>

              {/* Ubicación */}
              <UbicacionSelector
                errors={errors}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              {/* Encargado */}
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
                errors={errors}
              />

              {/* Categoría */}
              <section className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.categoriaId ? 'border-red-500' : 'border-gray-300'
                  } ${loading || isSubmitting ? 'cursor-not-allowed bg-gray-100' : ''}`}
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
                  <p className="text-sm text-red-500">
                    {errors.categoriaId.message}
                  </p>
                )}
              </section>

              {/* Botones */}
              <div className="flex gap-3 border-t pt-6">
                <button
                  type="button"
                  disabled={loading || isSubmitting}
                  className={`flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`flex-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
