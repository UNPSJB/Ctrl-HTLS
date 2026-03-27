import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import useUbicacion from '@/hooks/useUbicacion';
import { FormField, SelectInput, TextInput, RedirectLink } from '@form';

// Selector cascada de ubicación: País -> Provincia -> Ciudad refactorizado con suite @form
const UbicacionSelector = ({ 
  errors = {}, 
  register, 
  setValue, 
  watch,
  showAddress = false,
  addressFieldName = 'direccion',
  required = true
}) => {
  const {
    paises,
    provincias,
    ciudades,
    paisId,
    provinciaId,
    ciudadId,
    isProvinciasDisabled,
    isCiudadesDisabled,
    handlePaisChange,
    handleProvinciaChange,
    handleCiudadChange,
    setInitialUbicacion,
    loadingPaises,
    loadingProvincias,
    loadingCiudades,
  } = useUbicacion();

  // Sincronización inicial desde el formulario (Modo Edición)
  useEffect(() => {
    const fPaisId = watch('paisId');
    const fProvinciaId = watch('provinciaId');
    const fCiudadId = watch('ciudadId');

    if (fPaisId && !paisId) {
      setInitialUbicacion(fPaisId, fProvinciaId, fCiudadId);
    }
  }, [watch, paisId, setInitialUbicacion]);

  // Actualizar el formulario solo cuando el hook cambia (y sea diferente al valor actual)
  useEffect(() => {
    if (paisId && watch('paisId') !== paisId) {
      setValue('paisId', paisId, { shouldDirty: true });
    }
  }, [paisId, setValue, watch]);

  useEffect(() => {
    if (provinciaId && watch('provinciaId') !== provinciaId) {
      setValue('provinciaId', provinciaId, { shouldDirty: true });
    }
  }, [provinciaId, setValue, watch]);

  useEffect(() => {
    if (ciudadId && watch('ciudadId') !== ciudadId) {
      setValue('ciudadId', ciudadId, { shouldDirty: true });
    }
  }, [ciudadId, setValue, watch]);

  const handlePaisChangeInternal = (value) => {
    handlePaisChange(value);
    setValue('paisId', value, { shouldValidate: true, shouldDirty: true });
  };

  const handleProvinciaChangeInternal = (value) => {
    handleProvinciaChange(value);
    setValue('provinciaId', value, { shouldValidate: true, shouldDirty: true });
  };

  const handleCiudadChangeInternal = (value) => {
    handleCiudadChange(value);
    setValue('ciudadId', value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
      <FormField label="País" required={required} error={errors.paisId}>
        <SelectInput
          {...register('paisId', { required: required ? 'Debe seleccionar un país' : false })}
          value={paisId}
          onChange={(e) => handlePaisChangeInternal(e.target.value)}
          disabled={loadingPaises}
        >
          <option value="">
            {loadingPaises ? 'Cargando países...' : 'Seleccionar país'}
          </option>
          {(paises || []).map((pais) => (
            <option key={pais.id} value={pais.id.toString()}>
              {pais.nombre}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Provincia/Estado" required={required} error={errors.provinciaId}>
        <SelectInput
          {...register('provinciaId', {
            required: required ? 'Debe seleccionar una provincia' : false,
          })}
          value={provinciaId}
          onChange={(e) => handleProvinciaChangeInternal(e.target.value)}
          disabled={isProvinciasDisabled || loadingProvincias}
        >
          <option value="">
            {loadingProvincias
              ? 'Cargando provincias...'
              : paisId
                ? 'Seleccionar provincia'
                : 'Primero seleccione un país'}
          </option>
          {(provincias || []).map((provincia) => (
            <option key={provincia.id} value={provincia.id.toString()}>
              {provincia.nombre}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Ciudad" required={required} error={errors.ciudadId}>
        <SelectInput
          {...register('ciudadId', {
            required: required ? 'Debe seleccionar una ciudad' : false,
          })}
          value={ciudadId}
          onChange={(e) => handleCiudadChangeInternal(e.target.value)}
          disabled={isCiudadesDisabled || loadingCiudades}
        >
          <option value="">
            {loadingCiudades
              ? 'Cargando ciudades...'
              : provinciaId
                ? 'Seleccionar ciudad'
                : 'Primero seleccione una provincia'}
          </option>
          {(ciudades || []).map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id.toString()}>
              {ciudad.nombre}
            </option>
          ))}
        </SelectInput>
      </FormField>

      {showAddress && (
        <FormField label="Dirección" required={required} error={errors[addressFieldName]}>
          <TextInput
            id={addressFieldName}
            {...register(addressFieldName, { 
              required: required ? 'La dirección es obligatoria' : false 
            })}
            placeholder="Calle, Número, Depto..."
          />
        </FormField>
      )}

      {/* Redirección a Gestión de Ubicaciones */}
      <RedirectLink
        to="/admin/ubicacion"
        text="¿No encuentras la ubicación que buscas?"
        label="Gestionar ubicaciones aquí"
        newTab
        className="col-span-full mt-2"
      />
    </div>
  );
};

export default UbicacionSelector;
