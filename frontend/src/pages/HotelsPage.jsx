import HotelCard from '@/components/ui/HotelCard';

const HotelsPage = () => {
  const hotels = [
    {
      id: 1,
      image: 'https://via.placeholder.com/400x200',
      stars: 4.8,
      name: 'Hotel Marina Bay',
      price: 199,
      location: 'Barcelona, España',
      priceLabel: 'Precio por noche',
      description:
        'Disfruta de vistas espectaculares al mar en nuestras lujosas habitaciones con todo el confort.',
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/400x200',
      stars: 4.5,
      name: 'Grand Palace',
      price: 250,
      location: 'Madrid, España',
      priceLabel: 'Precio por noche',
      description:
        'Experimenta el lujo en el corazón de la ciudad con servicios exclusivos y gastronomía de primera clase.',
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/400x200',
      stars: 4.3,
      name: 'Mountain Retreat',
      price: 120,
      location: 'Andorra',
      priceLabel: 'Precio por noche',
      description:
        'Escápate a las montañas y relájate rodeado de naturaleza en un ambiente tranquilo y acogedor.',
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/400x200',
      stars: 4.1,
      name: 'City Lights Hotel',
      price: 180,
      location: 'Valencia, España',
      priceLabel: 'Precio por noche',
      description:
        'Vive la emoción de la ciudad con habitaciones modernas y una ubicación privilegiada.',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {/* Iterar sobre el array para renderizar cada tarjeta */}
      {hotels.map((hotel) => (
        <div key={hotel.id} className="w-full">
          <HotelCard
            image={hotel.image}
            stars={hotel.stars}
            name={hotel.name}
            price={hotel.price}
            location={hotel.location}
            priceLabel={hotel.priceLabel}
            description={hotel.description}
          />
        </div>
      ))}
    </div>
  );
};

export default HotelsPage;
