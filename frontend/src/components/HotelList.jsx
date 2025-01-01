import PropTypes from 'prop-types';
import HotelCardGrid from './ui/cards/HotelCardGrid';
import HotelCardList from './ui/cards/HotelCardList';

const HotelList = ({ hotels, viewMode }) => {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-7'
          : 'flex flex-col gap-7'
      }
    >
      {hotels.map((hotel) =>
        viewMode === 'grid' ? (
          <HotelCardGrid
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
          <HotelCardList
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
