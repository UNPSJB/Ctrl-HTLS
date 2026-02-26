import { Building2, ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useHotelForm from '@/hooks/useHotelForm';
import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import useHotel from '@/hooks/useHotel';
import { InnerLoading } from '@/components/ui/InnerLoading';

export default function AdminCreateHotelForm() {
  const navigate = useNavigate();
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
  const handleCancel = () => navigate('/admin/hoteles');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado Externo */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registrar Nuevo Hotel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete la información para dar de alta un hotel y su encargado administrador
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <InnerLoading message="Preparando formulario de registro..." />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-6 flex-1 flex flex-col"
          >
            <div className="flex-1 space-y-8 animate-in fade-in duration-500">
              {/* Información Básica */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-700">
                  <div className="h-4 w-1 rounded-full bg-blue-600"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Información Básica
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all shadow-sm"
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">
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
                      placeholder="Ej: +54 376 4123456"
                      disabled={loading || isSubmitting}
                      {...register('telefono', {
                        required: 'El teléfono es obligatorio',
                      })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all shadow-sm"
                    />
                    {errors.telefono && (
                      <p className="text-xs text-red-500">
                        {errors.telefono.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <label
                      htmlFor="direccion"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Dirección *
                    </label>
                    <input
                      id="direccion"
                      type="text"
                      placeholder="Ej: Av. Principal 123"
                      disabled={loading || isSubmitting}
                      {...register('direccion', {
                        required: 'La dirección es obligatoria',
                      })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all shadow-sm"
                    />
                    {errors.direccion && (
                      <p className="text-xs text-red-500">
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all shadow-sm"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría *
                  </label>
                  <select
                    {...register('categoriaId', {
                      required: 'Debe seleccionar una categoría',
                    })}
                    value={watch('categoriaId') || ''}
                    disabled={loading || isSubmitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 transition-all shadow-sm"
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
                    <p className="text-xs text-red-500">
                      {errors.categoriaId.message}
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
            </div>

            {/* Footer de Acciones */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading || isSubmitting}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Registrar Hotel y Encargado
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
