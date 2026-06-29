import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const TrendingSlider = ({ shows = [] }) => {

  return (

    <SliderRow title="Trending Now">

      {shows.map((show) => (

        <PosterCard
  key={`${show.media_type}-${show.tmdbId}`}
  item={show}
/>

      ))}

    </SliderRow>

  );

};

export default TrendingSlider;