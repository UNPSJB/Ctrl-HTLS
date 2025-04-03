import HotelCard from './ui/HotelCard';

const HotelList = () => {
  // Datos de ejemplo del hotel
  const hotelData = {
    nombre: 'Hotel Paraíso',
    estrellas: 5,
    ubicacion: {
      pais: 'Argentina',
      provincia: 'Buenos Aires',
      ciudad: 'Mar del Plata',
    },
    descripcion:
      'Disfruta de una experiencia única en nuestro hotel de lujo frente al mar con vistas panorámicas al océano, múltiples restaurantes y un spa de clase mundial.',
    habitaciones: [
      {
        nombre: 'Suite Ejecutiva',
        capacidad: 2,
        precio: 200,
      },
      {
        nombre: 'Habitación Doble',
        capacidad: 4,
        precio: 150,
      },
      {
        nombre: 'Habitación Individual',
        capacidad: 1,
        precio: 100,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hotel List</h1>
      <HotelCard hotel={hotelData} /> {/* ✅ Pasamos el hotel como prop */}
    </div>
  );
};

export default HotelList;
