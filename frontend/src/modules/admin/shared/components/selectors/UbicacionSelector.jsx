import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import useUbicacion from '@/hooks/useUbicacion';
import { FormField, SelectInput, RedirectLink } from '@form';

// Selector cascada de ubicación: País -> Provincia -> Ciudad refactorizado con suite @form
const UbicacionSelector = ({ errors = {}, register, setValue, watch }) => {
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
      setValue('paisId', paisId);
    }
  }, [paisId, setValue, watch]);

  useEffect(() => {
    if (provinciaId && watch('provinciaId') !== provinciaId) {
      setValue('provinciaId', provinciaId);
    }
  }, [provinciaId, setValue, watch]);

  useEffect(() => {
    if (ciudadId && watch('ciudadId') !== ciudadId) {
      setValue('ciudadId', ciudadId);
    }
  }, [ciudadId, setValue, watch]);

  const handlePaisChangeInternal = (value) => {
    handlePaisChange(value);
    setValue('paisId', value);
  };

  const handleProvinciaChangeInternal = (value) => {
    handleProvinciaChange(value);
    setValue('provinciaId', value);
  };

  const handleCiudadChangeInternal = (value) => {
    handleCiudadChange(value);
    setValue('ciudadId', value);
  };

  return (
    <>
      <FormField label="País" required error={errors.paisId}>
        <SelectInput
          {...register('paisId', { required: 'Debe seleccionar un país' })}
          value={paisId}
          onChange={(e) => handlePaisChangeInternal(e.target.value)}
        >
          <option value="">Seleccionar país</option>
          {(paises || []).map((pais) => (
            <option key={pais.id} value={pais.id.toString()}>
              {pais.nombre}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Provincia/Estado" required error={errors.provinciaId}>
        <SelectInput
          {...register('provinciaId', {
            required: 'Debe seleccionar una provincia',
          })}
          value={provinciaId}
          onChange={(e) => handleProvinciaChangeInternal(e.target.value)}
          disabled={isProvinciasDisabled}
        >
          <option value="">
            {paisId ? 'Seleccionar provincia' : 'Primero seleccione un país'}
          </option>
          {(provincias || []).map((provincia) => (
            <option key={provincia.id} value={provincia.id.toString()}>
              {provincia.nombre}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Ciudad" required error={errors.ciudadId}>
        <SelectInput
          {...register('ciudadId', {
            required: 'Debe seleccionar una ciudad',
          })}
          value={ciudadId}
          onChange={(e) => handleCiudadChangeInternal(e.target.value)}
          disabled={isCiudadesDisabled}
        >
          <option value="">
            {provinciaId
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

      {/* Redirección a Gestión de Ubicaciones */}
      <RedirectLink
        to="/admin/ubicacion"
        text="¿No encuentras la ubicación que buscas?"
        label="Gestionar ubicaciones aquí"
        newTab
        className="col-span-full mt-2"
      />
    </>
  );
};

export default UbicacionSelector;
