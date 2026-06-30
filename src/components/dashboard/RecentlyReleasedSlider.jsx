import SliderRow from "./SliderRow";
import PosterCard from "./PosterCard";

const RecentlyReleasedSlider = ({
  shows = [],
}) => {

  return (
    <SliderRow
      title="Recently Released"
    >

      {shows.map((show) => (

        <PosterCard
        //   key={`${show.id}-${show.media_type || "item"}`}
        key={`${show.media_type || "item"}-${show.tmdbId}`}
          item={show}
          clickable={false}
        />

      ))}

    </SliderRow>
  );

};

export default RecentlyReleasedSlider;