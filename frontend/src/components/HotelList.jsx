import HotelCard from './ui/HotelCard';
import PropTypes from 'prop-types';

const HotelList = ({ hotels }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-7">
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
HotelList.propTypes = {
  hotels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      stars: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      location: PropTypes.string.isRequired,
      priceLabel: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default HotelList;
