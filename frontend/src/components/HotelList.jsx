import PropTypes from 'prop-types';
import HotelVerticalCard from './ui/cards/HotelVerticalCard';
import HotelHorizontalCard from './ui/cards/HotelHorizontalCard';
import HotelListCard from './ui/cards/HotelListCard';

const HotelList = ({ hotels, viewMode }) => {
  return (
    <div
      className={`${
        viewMode === 'grid'
          ? 'grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]'
          : viewMode === 'list'
            ? 'flex flex-col gap-6'
            : 'flex flex-col gap-3'
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
        ) : viewMode === 'list' ? (
          <HotelHorizontalCard
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
          <HotelListCard
            key={hotel.id}
            id={hotel.id}
            stars={hotel.stars}
            name={hotel.name}
            price={hotel.price}
          />
        )
      )}
    </div>
  );
};

HotelList.propTypes = {
  hotels: PropTypes.array.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list', 'compact']).isRequired,
};

export default HotelList;
