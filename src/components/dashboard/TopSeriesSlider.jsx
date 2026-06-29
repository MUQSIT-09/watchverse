import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const TopSeriesSlider = ({ shows = [] }) => {

  return (

    <SliderRow title="Top Series">

      {shows.map((show) => (

        <PosterCard
          key={`tv-${show.tmdbId}`}
          item={show}
        />

      ))}

    </SliderRow>

  );

};

export default TopSeriesSlider;