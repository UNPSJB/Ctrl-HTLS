import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from '../api/axiosInstance'; // Asegúrate de que esta ruta sea correcta
import Swal from 'sweetalert2';

const useHotelForm = () => {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioTemporal, setPrecioTemporal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertaAccion, setAlertaAccion] = useState(false);

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

      // Campo virtual para validar tipos de habitaciones
      tiposHabitaciones: [],
    },
  });

  const { setValue, clearErrors, setError } = form;

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

        const nuevosSeleccionados = [...tiposSeleccionados, nuevoTipo];
        setTiposSeleccionados(nuevosSeleccionados);

        // Actualizar el campo virtual para la validación
        setValue('tiposHabitaciones', nuevosSeleccionados);

        // Limpiar error si existe
        clearErrors('tiposHabitaciones');

        setSelectedTipo('');
        setPrecioTemporal('');
      }
    }
  };

  const handleTipoHabitacionRemove = (tipoId) => {
    const nuevosSeleccionados = tiposSeleccionados.filter(
      (tipo) => tipo.id !== tipoId
    );
    setTiposSeleccionados(nuevosSeleccionados);

    // Actualizar el campo virtual para la validación
    setValue('tiposHabitaciones', nuevosSeleccionados);

    // Si no quedan tipos, mostrar error
    if (nuevosSeleccionados.length === 0) {
      setError('tiposHabitaciones', {
        type: 'required',
        message: 'Debe agregar al menos un tipo de habitación',
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Validación adicional para tipos de habitaciones
      if (tiposSeleccionados.length === 0) {
        setError('tiposHabitaciones', {
          type: 'required',
          message: 'Debe agregar al menos un tipo de habitación',
        });
        return;
      }

      // Preparar datos del encargado
      const encargadoData = {
        nombre: data.encargadoNombre,
        apellido: data.encargadoApellido,
        tipoDocumento: data.encargadoTipoDocumento,
        numeroDocumento: data.encargadoNumeroDocumento,
      };

      console.log('Enviando datos del encargado:', encargadoData);

      // Crear el encargado primero
      let encargadoId;
      try {
        const respEncargado = await axios.post(
          '/hotel/encargados',
          encargadoData
        );
        encargadoId = respEncargado.data.id;
      } catch (error) {
        const mensaje =
          error.response?.data?.error || 'Error al crear el encargado';
        Swal.fire('Error', mensaje, 'error');
      }

      // Preparar datos del hotel con el ID del encargado
      const hotelData = {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        paisId: data.paisId,
        provinciaId: data.provinciaId,
        ciudadId: data.ciudadId,
        categoriaId: data.categoriaId,
        encargadoId: encargadoId,
        tipoHabitaciones: tiposSeleccionados,
      };

      // Crear el hotel
      try {
        const respHotel = await axios.post('/hotel', hotelData);
        resetForm();
        setAlertaAccion(true);
        setAlertaAccion(true);

        Swal.fire({
          icon: 'success',
          title: 'Hotel creado exitosamente',
          text: `El hotel "${data.nombre}" fue registrado.`,
          confirmButtonColor: '#3085d6',
        });
        return { encargadoId, hotelData: respHotel.data };
      } catch (error) {
        const mensaje =
          error.response?.data?.error || 'Error al crear el hotel';
        Swal.fire('Error', mensaje, 'error');
      }
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error de servidor';
      Swal.fire('Error', mensaje, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAlert = () => {
    setAlertaAccion(false);
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
    closeAlert,
    alertaAccion,

    // Validaciones
    canAddTipoHabitacion:
      selectedTipo && precioTemporal && !isNaN(precioTemporal),
  };
};

export default useHotelForm;
