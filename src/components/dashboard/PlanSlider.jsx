import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const PlanSlider = ({
  shows = [],
}) => {

  return (

    <SliderRow title="Watchlist">

      {shows.map((show) => (

        <PosterCard
          key={show.tmdbId}
          item={show}
        />

      ))}

    </SliderRow>

  );
};

export default PlanSlider;