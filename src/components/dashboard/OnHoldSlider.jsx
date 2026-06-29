import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const OnHoldSlider = ({
  shows = [],
}) => {

  return (

    <SliderRow title="Paused">

      {shows.map((show) => (

        <PosterCard
          key={show.tmdbId}
          item={show}
        />

      ))}

    </SliderRow>

  );
};

export default OnHoldSlider;