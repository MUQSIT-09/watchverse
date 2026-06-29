import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const UpcomingSlider = ({ shows = [] }) => {

  return (

    <SliderRow title="Coming Soon">

      {shows.map((show) => (

        <PosterCard
          key={`upcoming-${show.tmdbId}`}
          item={show}
        />

      ))}

    </SliderRow>

  );

};

export default UpcomingSlider;