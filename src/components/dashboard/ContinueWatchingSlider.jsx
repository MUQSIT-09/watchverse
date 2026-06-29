import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";
import { useNavigate } from "react-router-dom";

const ContinueWatchingSlider = ({
  shows = [],
}) => {

  const navigate = useNavigate();

  return (
    <SliderRow title="Resume Watching">

      {shows.map((show) => (

        <PosterCard
          key={show.tmdbId}
          item={show}
          onClick={() =>
            navigate(
              `/library?tab=watching&show=${show.tmdbId}`
            )
          }
        />

      ))}

    </SliderRow>
  );
};

export default ContinueWatchingSlider;