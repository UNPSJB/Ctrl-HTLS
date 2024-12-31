import React, { useState } from 'react';

const HotelFormPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    image: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hotel Data:', formData);
    // Aquí puedes manejar el envío de datos al backend
  };

  return (
    <div className="flex justify-center items-start bg-accent-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 py-10 rounded-lg shadow-lg border border-secondary-200"
      >
        <h1 className="text-secondary-700 font-bold text-2xl mb-4 text-center">
          Agregar Nuevo Hotel
        </h1>

        <div className="mb-4">
          <label htmlFor="name" className="block text-text-700 font-medium">
            Nombre del Hotel
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-secondary-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ejemplo: Hotel Paraíso"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-text-700 font-medium">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-secondary-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ejemplo: Ciudad, País"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-text-700 font-medium">
            Precio por noche (USD)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-secondary-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ejemplo: 100"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-text-700 font-medium">
            URL de Imagen
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-secondary-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ejemplo: https://imagen.com/hotel.jpg"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-text-700 font-medium"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-secondary-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Descripción breve del hotel"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition duration-200"
        >
          Guardar Hotel
        </button>
      </form>
    </div>
  );
};

export default HotelFormPage;
