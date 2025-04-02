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
    imagen: 'Hotel Paraíso.webp',
    habitaciones: [
      { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
      { nombre: 'Suite Ejecutiva', capacidad: 3, precio: 300 },
    ],
    paquetes: [
      {
        nombre: 'Escapada Romántica',
        habitaciones: [
          { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
        ],
        descuento: 10, // %
        noches: 3,
        descripcion:
          'Una escapada romántica para dos personas con cena incluida.',
      },
      {
        nombre: 'Aventura Familiar',
        habitaciones: [
          { nombre: 'Suite Ejecutiva', capacidad: 3, precio: 300 },
          { nombre: 'Habitación Deluxe', capacidad: 2, precio: 200 },
        ],
        descuento: 15,
        noches: 5,
        descripcion: 'Paquete familiar con actividades para niños y adultos.',
      },
    ],
  };

  return (
    <div className="p-6">
      <HotelCard hotel={hotelData} />
    </div>
  );
};

export default HotelList;
