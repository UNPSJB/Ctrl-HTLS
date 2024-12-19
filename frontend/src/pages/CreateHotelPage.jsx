import { useState } from 'react';

const CrearHotel = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    habitaciones: '',
    precio: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
    // Aquí podrías agregar la lógica para enviar los datos al backend
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary-500 mb-4">Crear Hotel</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Nombre del Hotel */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="nombre"
          >
            Nombre del Hotel
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ingrese el nombre del hotel"
          />
        </div>

        {/* Ubicación */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="ubicacion"
          >
            Ubicación
          </label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ingrese la ubicación"
          />
        </div>

        {/* Cantidad de habitaciones */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="habitaciones"
          >
            Cantidad de Habitaciones
          </label>
          <input
            type="number"
            id="habitaciones"
            name="habitaciones"
            value={formData.habitaciones}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ingrese la cantidad de habitaciones"
          />
        </div>

        {/* Precio por Noche */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="precio"
          >
            Precio por Noche
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ingrese el precio por noche"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearHotel;
