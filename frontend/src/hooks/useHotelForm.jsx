import { useState } from 'react';
import { useForm } from 'react-hook-form';

const useHotelForm = () => {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioTemporal, setPrecioTemporal] = useState('');

  const form = useForm({
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      encargadoId: '',
      categoriaId: '',
    },
  });

  const handleAgregarTipoHabitacion = () => {
    if (selectedTipo && precioTemporal && !isNaN(precioTemporal)) {
      const tipoExiste = tiposSeleccionados.find(
        (tipo) => tipo.id === Number.parseInt(selectedTipo)
      );

      if (!tipoExiste) {
        const nuevoTipo = {
          id: Number.parseInt(selectedTipo),
          precio: Number.parseInt(precioTemporal),
        };

        setTiposSeleccionados([...tiposSeleccionados, nuevoTipo]);
        setSelectedTipo('');
        setPrecioTemporal('');
      }
    }
  };

  const handleTipoHabitacionRemove = (tipoId) => {
    setTiposSeleccionados(
      tiposSeleccionados.filter((tipo) => tipo.id !== tipoId)
    );
  };

  const onSubmit = (data, ubicacionData) => {
    const formData = {
      ...data,
      paisId: ubicacionData.paisId,
      provinciaId: ubicacionData.provinciaId,
      ciudadId: ubicacionData.ciudadId,
      tipoHabitaciones: tiposSeleccionados,
    };

    console.log('Datos del hotel:', formData);
    return formData;
  };

  const resetForm = () => {
    form.reset();
    setTiposSeleccionados([]);
    setSelectedTipo('');
    setPrecioTemporal('');
  };

  return {
    // Form methods
    ...form,

    // Tipos de habitaciones
    tiposSeleccionados,
    selectedTipo,
    setSelectedTipo,
    precioTemporal,
    setPrecioTemporal,
    handleAgregarTipoHabitacion,
    handleTipoHabitacionRemove,

    // Submit y reset
    onSubmit,
    resetForm,

    // Validaciones
    canAddTipoHabitacion:
      selectedTipo && precioTemporal && !isNaN(precioTemporal),
  };
};

export default useHotelForm;
