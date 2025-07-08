import axios from '@/api/axiosInstance';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const useHotelForm = () => {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioTemporal, setPrecioTemporal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [encargadoNuevo, setEncargadoNuevo] = useState(null);

  const form = useForm({
    defaultValues: {
      // Datos del hotel
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      categoriaId: '',

      // Datos de ubicación
      paisId: '',
      provinciaId: '',
      ciudadId: '',

      // Datos del encargado
      encargadoNombre: '',
      encargadoApellido: '',
      encargadoTipoDocumento: '',
      encargadoNumeroDocumento: '',
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

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validar que se hayan seleccionado los datos de ubicación
      if (!data.paisId || !data.provinciaId || !data.ciudadId) {
        alert('Por favor seleccione país, provincia y ciudad');
        return;
      }

      // Preparar datos del encargado
      const encargadoData = {
        nombre: data.encargadoNombre,
        apellido: data.encargadoApellido,
        tipoDocumento: data.encargadoTipoDocumento,
        numeroDocumento: data.encargadoNumeroDocumento,
      };
      let response;
      try {
        response = await axios.post('/hotel/encargados', encargadoData);
      } catch (error) {
        console.error('Error al crear el encargado:', error);
      }

      // Preparar datos del hotel
      const hotelData = {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        ciudadId: data.ciudadId, // Ahora se incluye correctamente
        categoriaId: data.categoriaId,
        encargadoId: response.data.id, // ID del encargado recién creado
        tipoHabitaciones: tiposSeleccionados,
      };

      const hotelResponse = await axios.post('/hotel', hotelData);

      console.log('Hotel creado:', hotelResponse.data);

      //return { encargadoId, hotelData };
    } catch (error) {
      console.error('Error al crear hotel:', error);
      alert('Error al crear el hotel. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
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
    isSubmitting,

    // Validaciones
    canAddTipoHabitacion:
      selectedTipo && precioTemporal && !isNaN(precioTemporal),
  };
};

export default useHotelForm;
