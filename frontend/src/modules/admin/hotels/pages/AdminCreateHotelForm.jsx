import { Building2, ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useHotelForm from '@admin-hooks/useHotelForm';
import UbicacionSelector from '@/modules/admin/shared/components/selectors/UbicacionSelector';
import TiposHabitacionSelector from '@/modules/admin/shared/components/selectors/TipoHabitacionSelector';
import EncargadoForm from '@/modules/admin/encargados/components/EncargadoForm';
import useHotel from '@admin-hooks/useHotel';
import { InnerLoading } from '@/components/ui/InnerLoading';
import { 
  FormField, 
  TextInput, 
  EmailInput, 
  TelInput, 
  SelectInput 
} from '@form';

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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <InnerLoading message="Preparando formulario de registro..." />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-6 flex-1 flex flex-col space-y-8"
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
                  <FormField label="Nombre del Hotel" required error={errors.nombre}>
                    <TextInput
                      id="nombre"
                      placeholder="Ej: Hotel Paradise Resort"
                      disabled={loading || isSubmitting}
                      {...register('nombre', {
                        required: 'El nombre es obligatorio',
                      })}
                    />
                  </FormField>

                  <FormField label="Teléfono" required error={errors.telefono}>
                    <TelInput
                      id="telefono"
                      placeholder="Ej: +54 376 4123456"
                      disabled={loading || isSubmitting}
                      {...register('telefono', {
                        required: 'El teléfono es obligatorio',
                      })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField label="Dirección" required error={errors.direccion}>
                    <TextInput
                      id="direccion"
                      placeholder="Ej: Av. Principal 123"
                      disabled={loading || isSubmitting}
                      {...register('direccion', {
                        required: 'La dirección es obligatoria',
                      })}
                    />
                  </FormField>

                  <FormField label="Email" required error={errors.email}>
                    <EmailInput
                      id="email"
                      placeholder="Ej: contacto@hotel.com"
                      disabled={loading || isSubmitting}
                      {...register('email', {
                        required: 'El email es obligatorio',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido',
                        },
                      })}
                    />
                  </FormField>
                </div>

                <FormField label="Categoría" required error={errors.categoriaId}>
                  <SelectInput
                    {...register('categoriaId', {
                      required: 'Debe seleccionar una categoría',
                    })}
                    value={watch('categoriaId') || ''}
                    disabled={loading || isSubmitting}
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
                  </SelectInput>
                </FormField>
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
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-700">
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
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
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
