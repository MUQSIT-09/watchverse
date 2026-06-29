const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const options = {
  method: "GET",

  headers: {
    accept: "application/json",

    Authorization: `Bearer ${TOKEN}`,
  },
};

const getToday = () => {

  return new Date()
    .toISOString()
    .split("T")[0];

};

const fetchDiscoverPages = async (
  mediaType,
  startPage,
  endPage,
  extraParams = ""
) => {

  const requests = [];

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {

    requests.push(

      fetch(

        `${BASE_URL}/discover/${mediaType}?language=en-US&page=${page}${extraParams}`,

        options

      ).then(res => res.json())

    );

  }

  const responses =
    await Promise.all(requests);

  return responses
    .flatMap(page => page.results || [])
    .map(item => ({
      ...item,
      media_type: mediaType,
    }));

};

const fetchPages = async (
  endpoint,
  startPage,
  endPage,
  mediaType
) => {

  const requests = [];

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {

    requests.push(

      fetch(
        `${BASE_URL}/${endpoint}?language=en-US&page=${page}`,
        options
      ).then(res => res.json())

    );

  }

  const responses =
    await Promise.all(requests);

  return responses
    .flatMap(page => page.results || [])
    .map(item => ({
      ...item,
      media_type: mediaType,
    }));

};

const BASE_URL = "https://api.themoviedb.org/3";

export const searchMulti = async (query) => {

  const response = await fetch(

    `${BASE_URL}/search/multi?query=${encodeURIComponent(
      query
    )}&language=en-US&page=1`,

    options

  );

  return response.json();

};

// export const getShowDetails = async (
//   id,
//   mediaType
// ) => {

//   const response = await fetch(

//     `${BASE_URL}/${mediaType}/${id}?language=en-US`,

//     options

//   );

//   return response.json();

// };

// export const getTrending = async () => {

//   const response = await fetch(

//     `${BASE_URL}/trending/all/week`,

//     options

//   );

//   return response.json();

// };

export const getShowDetails = async (
  id,
  mediaType
) => {


  if(!id) return null;


  try {


    const response = await fetch(

      `${BASE_URL}/${mediaType}/${id}?language=en-US`,

      options

    );


    if(!response.ok){

      console.log(
        "TMDB missing:",
        id
      );

      return null;

    }


    return await response.json();



  } catch(error){


    console.log(
      "TMDB error",
      error
    );


    return null;


  }


};

export const getTrending = async () => {

  const pages = await Promise.all([

    fetch(
      `${BASE_URL}/trending/all/week?page=1`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/trending/all/week?page=2`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/trending/all/week?page=3`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/trending/all/week?page=4`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/trending/all/week?page=5`,
      options
    ).then((r) => r.json()),
  ]);

  const allResults = pages.flatMap(
  (page) => page.results || []
);

const uniqueResults = allResults.filter(
  (item, index, self) =>
    index ===
    self.findIndex(
      (t) =>
        t.id === item.id &&
        t.media_type === item.media_type
    )
);

return {
  results: uniqueResults,
};
};

// export const getTopMovies = async () => {

//   const response = await fetch(

//     `${BASE_URL}/movie/top_rated?language=en-US&page=1`,

//     options

//   );

//   return response.json();

// };

export const getTopMovies = async () => {

  const pages = await Promise.all([

    fetch(
      `${BASE_URL}/movie/top_rated?language=en-US&page=1`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/movie/top_rated?language=en-US&page=2`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/movie/top_rated?language=en-US&page=3`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/movie/top_rated?language=en-US&page=4`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/movie/top_rated?language=en-US&page=5`,
      options
    ).then((r) => r.json()),
  ]);

  const allResults = pages.flatMap(
  (page) => page.results || []
);

const uniqueResults = allResults.filter(
  (item, index, self) =>
    index ===
    self.findIndex(
      (t) => t.id === item.id
    )
);

return {
  results: uniqueResults,
};
};


// export const getTopSeries = async () => {

//   const response = await fetch(

//     `${BASE_URL}/tv/top_rated?language=en-US&page=1`,

//     options

//   );

//   return response.json();

// };


export const getTopSeries = async () => {

  const pages = await Promise.all([

    fetch(
      `${BASE_URL}/tv/top_rated?language=en-US&page=1`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/tv/top_rated?language=en-US&page=2`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/tv/top_rated?language=en-US&page=3`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/tv/top_rated?language=en-US&page=4`,
      options
    ).then((r) => r.json()),

    fetch(
      `${BASE_URL}/tv/top_rated?language=en-US&page=5`,
      options
    ).then((r) => r.json()),
  ]);

  const allResults = pages.flatMap(
  (page) => page.results || []
);

const uniqueResults = allResults.filter(
  (item, index, self) =>
    index ===
    self.findIndex(
      (t) => t.id === item.id
    )
);

return {
  results: uniqueResults,
};
};

export const getUpcoming = async () => {

  const today = getToday();

  const [

    movies,

    series,

  ] = await Promise.all([

    fetchDiscoverPages(

      "movie",

      1,

      10,

      `&sort_by=primary_release_date.asc&primary_release_date.gte=${today}`

    ),

    fetchDiscoverPages(

      "tv",

      1,

      10,

      `&sort_by=first_air_date.asc&first_air_date.gte=${today}`

    ),

  ]);

  const unique = [

    ...movies,

    ...series,

  ].filter(

    (item, index, self) =>

      index ===

      self.findIndex(

        t =>

          t.id === item.id &&

          t.media_type === item.media_type

      )

  );

  unique.sort((a, b) => {

    const d1 = new Date(
      a.release_date ||
      a.first_air_date
    );

    const d2 = new Date(
      b.release_date ||
      b.first_air_date
    );

    return d1 - d2;

  });

  return {

    results: unique,

  };

};

export const getRecentlyReleased = async () => {

  const today = getToday();

  const [

    movies,

    series,

  ] = await Promise.all([

    fetchDiscoverPages(

      "movie",

      1,

      10,

      `&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`

    ),

    fetchDiscoverPages(

      "tv",

      1,

      10,

      `&sort_by=first_air_date.desc&first_air_date.lte=${today}`

    ),

  ]);

  const unique = [

    ...movies,

    ...series,

  ].filter(

    (item, index, self) =>

      index ===

      self.findIndex(

        t =>

          t.id === item.id &&

          t.media_type === item.media_type

      )

  );

  unique.sort((a, b) => {

    const d1 = new Date(
      a.release_date ||
      a.first_air_date
    );

    const d2 = new Date(
      b.release_date ||
      b.first_air_date
    );

    return d2 - d1;

  });

  return {

    results: unique,

  };

};

export const loadExtraPages = async (
  startPage,
  endPage
) => {

  const [

    moviesUpcoming,

    tvUpcoming,

    moviesRecent,

    tvRecent,

  ] = await Promise.all([

    fetchPages(
      "movie/upcoming",
      startPage,
      endPage,
      "movie"
    ),

    fetchPages(
      "tv/on_the_air",
      startPage,
      endPage,
      "tv"
    ),

    fetchPages(
      "movie/now_playing",
      startPage,
      endPage,
      "movie"
    ),

    fetchPages(
      "tv/airing_today",
      startPage,
      endPage,
      "tv"
    ),

  ]);

  return {

    upcoming:
      [...moviesUpcoming, ...tvUpcoming],

    recent:
      [...moviesRecent, ...tvRecent],

  };

};