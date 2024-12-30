import { useState, useEffect } from 'react';
import HotelCard from '@/components/ui/HotelCard';
import hotelsData from '@/data/hotels.json';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    // Cargamos los hoteles desde el archivo JSON
    setHotels(hotelsData);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-7 p-4">
      {hotels.map((hotel) => (
        <div key={hotel.id} className="w-full">
          <HotelCard
            id={hotel.id}
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
