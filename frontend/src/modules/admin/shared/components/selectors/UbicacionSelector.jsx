import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import useUbicacion from '@/hooks/useUbicacion';
import { FormField, TextInput, RedirectLink } from '@form';
import ComboboxInput from '@/components/ui/ComboboxInput';

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
        <ComboboxInput
          options={(paises || []).map((p) => ({ value: p.id.toString(), label: p.nombre }))}
          value={paisId ? paisId.toString() : ''}
          onChange={(val) => handlePaisChangeInternal(val)}
          placeholder={loadingPaises ? 'Cargando países...' : 'Seleccionar país'}
          disabled={loadingPaises}
          error={errors.paisId}
        />
      </FormField>

      <FormField label="Provincia/Estado" required={required} error={errors.provinciaId}>
        <ComboboxInput
          options={(provincias || []).map((p) => ({ value: p.id.toString(), label: p.nombre }))}
          value={provinciaId ? provinciaId.toString() : ''}
          onChange={(val) => handleProvinciaChangeInternal(val)}
          placeholder={loadingProvincias ? 'Cargando provincias...' : paisId ? 'Seleccionar provincia' : 'Primero seleccione un país'}
          disabled={isProvinciasDisabled || loadingProvincias}
          error={errors.provinciaId}
        />
      </FormField>

      <FormField label="Ciudad" required={required} error={errors.ciudadId}>
        <ComboboxInput
          options={(ciudades || []).map((c) => ({ value: c.id.toString(), label: c.nombre }))}
          value={ciudadId ? ciudadId.toString() : ''}
          onChange={(val) => handleCiudadChangeInternal(val)}
          placeholder={loadingCiudades ? 'Cargando ciudades...' : provinciaId ? 'Seleccionar ciudad' : 'Primero seleccione una provincia'}
          disabled={isCiudadesDisabled || loadingCiudades}
          error={errors.ciudadId}
        />
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
