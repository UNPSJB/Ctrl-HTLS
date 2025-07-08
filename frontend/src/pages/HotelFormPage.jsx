'use client';

import { Building2 } from 'lucide-react';
import useHotelForm from '@/hooks/useHotelForm';
import UbicacionSelector from '@/components/selectors/UbicacionSelector';
import TiposHabitacionSelector from '@/components/selectors/TipoHabitacionSelector';
import EncargadoForm from '@/components/forms/EncargadoForm';
import useHotel from '@/hooks/useHotel';
export default function Component() {
  const hotelForm = useHotelForm();
  const { tiposHabitacion, categorias, loading, error } = useHotel();

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

  // Mostrar mensaje de error si hay problemas cargando los datos
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error al cargar datos
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudieron cargar los datos necesarios para el formulario.
            </p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {(loading || isSubmitting) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {loading
                    ? 'Cargando datos del formulario...'
                    : 'Creando hotel y encargado...'}
                </p>
              </div>
            </div>
          )}

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
                tiposHabitaciones={tiposHabitacion}
                tiposSeleccionados={tiposSeleccionados}
                selectedTipo={selectedTipo}
                setSelectedTipo={setSelectedTipo}
                precioTemporal={precioTemporal}
                setPrecioTemporal={setPrecioTemporal}
                onAgregar={handleAgregarTipoHabitacion}
                onRemover={handleTipoHabitacionRemove}
                canAdd={canAddTipoHabitacion}
                loading={loading || isSubmitting}
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
