import PropTypes from 'prop-types';
import HotelVerticalCard from './ui/cards/HotelVerticalCard';
import HotelCardHorizontal from './ui/cards/HotelHorizontalCard';

const HotelList = ({ hotels, viewMode }) => {
  return (
    <div
      className={`${
        viewMode === 'grid'
          ? 'grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]'
          : 'flex flex-col gap-6'
      }`}
    >
      {hotels.map((hotel) =>
        viewMode === 'grid' ? (
          <HotelVerticalCard
            key={hotel.id}
            id={hotel.id}
            image={hotel.image}
            stars={hotel.stars}
            name={hotel.name}
            price={hotel.price}
            location={hotel.location}
            priceLabel={hotel.priceLabel}
            description={hotel.description}
          />
        ) : (
          <HotelCardHorizontal
            key={hotel.id}
            id={hotel.id}
            image={hotel.image}
            stars={hotel.stars}
            name={hotel.name}
            price={hotel.price}
            location={hotel.location}
            priceLabel={hotel.priceLabel}
            description={hotel.description}
          />
        )
      )}
    </div>
  );
};

HotelList.propTypes = {
  hotels: PropTypes.array.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
};

export default HotelList;
