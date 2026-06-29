import { useEffect, useState } from "react";

import {
  getTrending,
  getTopMovies,
  getTopSeries,
  getUpcoming,
  getRecentlyReleased,
} from "../services/tmdb";

const useDashboard = () => {

  const [trending,setTrending] = useState([]);

  const [movies,setMovies] = useState([]);

  const [series,setSeries] = useState([]);

  const [upcoming,setUpcoming] = useState([]);

  const [recentlyReleased,setRecentlyReleased] = useState([]);

  const [loading,setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [
          trendingData,
          movieData,
          seriesData,
          upcomingData,
          recentData,
        ] = await Promise.all([

          getTrending(),

          getTopMovies(),

          getTopSeries(),

          getUpcoming(),

          getRecentlyReleased(),

        ]);

        setTrending(
  trendingData.results || []
);

setMovies(
  movieData.results || []
);

setSeries(
  seriesData.results || []
);

setUpcoming(
  upcomingData.results || []
);

setRecentlyReleased(
  recentData.results || []
);
setLoading(false);
      }

      catch(error){

  console.log(error);

  setLoading(false);

}

    };

    fetchData();

  },[]);

  return {

  trending,

  movies,

  series,

  upcoming,

  recentlyReleased,

  loading,

};
};

export default useDashboard;