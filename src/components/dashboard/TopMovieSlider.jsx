import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const TopMovieSlider = ({ shows = [] }) => {

  return (

    <SliderRow title="Top Movies">

      {shows.map((show) => (

        <PosterCard
          key={`movie-${show.tmdbId}`}
          item={show}
          clickable={false}
        />

      ))}

    </SliderRow>

  );

};

export default TopMovieSlider;