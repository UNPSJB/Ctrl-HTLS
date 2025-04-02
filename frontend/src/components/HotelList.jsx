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
    descripcion: 'Un hotel de lujo con vista al mar y excelentes servicios.',
    imagen: 'https://source.unsplash.com/400x300/?hotel',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hotel List</h1>
      <HotelCard hotel={hotelData} /> {/* ✅ Pasamos el hotel como prop */}
    </div>
  );
};

export default HotelList;
