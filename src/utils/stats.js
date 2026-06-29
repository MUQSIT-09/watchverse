  const safeArray = (data) => {
  return Array.isArray(data) ? data : [];
};

  export const normalizeRuntime = (
  show
  ) => {

  if(!show.runtime){

  return 0;

  }

  return show.runtime > 500

  ? show.runtime

  : show.runtime * 60;

  };

  // CURRENT STREAK

  export const getCurrentStreak=
  (
  library
  )=>{

  let dates=[];

  library.forEach((show)=>{

    if(show.lastWatchedAt){

        dates.push(

        new Date(
        show.lastWatchedAt
        )

        .toISOString()

        .split("T")[0]

        );

    }

    show.watchHistory?.forEach(
    (ep)=>{

        if(ep.watchedAt){

          dates.push(

          new Date(
            ep.watchedAt
          )

          .toISOString()

          .split("T")[0]

          );

        }

    });

  });

  const unique=

  [...new Set(dates)]

  .sort()

  .reverse();

  if(!unique.length)
  return 0;

  let streak=1;

  for(

  let i=0;

  i<unique.length-1;

  i++

  ){

    const current=
    new Date(unique[i]);

    const previous=
    new Date(unique[i+1]);

    const diff=

    (

    current-previous

    )/

    (

    1000*60*60*24

    );

    if(diff===1){

        streak++;

    }

    else{

        break;

    }

  }

  return streak;

  };

  // Monthly streak 
  export const getCurrentMonthStreak = (library) => {

    const now = new Date();

    const month = now.getMonth();
    const year = now.getFullYear();

    let dates = [];
const lib = safeArray(library);

lib.forEach(show => {
      if(show.lastWatchedAt){

        const d = new Date(show.lastWatchedAt);

        if(
          d.getMonth() === month &&
          d.getFullYear() === year
        ){
          dates.push(
            d.toISOString().split("T")[0]
          );
        }

      }

      show.watchHistory?.forEach(ep => {

        if(!ep.watchedAt) return;

        const d = new Date(ep.watchedAt);

        if(
          d.getMonth() === month &&
          d.getFullYear() === year
        ){
          dates.push(
            d.toISOString().split("T")[0]
          );
        }

      });

    });

    const unique = [...new Set(dates)]
      .sort()
      .reverse();

    if(!unique.length) return 0;

    let streak = 1;

    for(let i=0;i<unique.length-1;i++){

      const current = new Date(unique[i]);

      const prev = new Date(unique[i+1]);

      const diff =
        (current-prev)/
        (1000*60*60*24);

      if(diff===1){

        streak++;

      }else{

        break;

      }

    }

    return streak;

  };

  // highest streak this month

  export const getHighestMonthStreak = (library) => {

    const now = new Date();

    const month = now.getMonth();
    const year = now.getFullYear();

    let dates = [];

    const lib = safeArray(library);

lib.forEach(show => {
      if(show.lastWatchedAt){

        const d = new Date(show.lastWatchedAt);

        if(
          d.getMonth()===month &&
          d.getFullYear()===year
        ){
          dates.push(
            d.toISOString().split("T")[0]
          );
        }

      }

      show.watchHistory?.forEach(ep=>{

        if(!ep.watchedAt) return;

        const d = new Date(ep.watchedAt);

        if(
          d.getMonth()===month &&
          d.getFullYear()===year
        ){
          dates.push(
            d.toISOString().split("T")[0]
          );
        }

      });

    });

    const unique =
      [...new Set(dates)]
      .sort();

    if(!unique.length)
      return 0;

    let highest = 1;
    let current = 1;

    for(let i=1;i<unique.length;i++){

      const prev =
        new Date(unique[i-1]);

      const curr =
        new Date(unique[i]);

      const diff =
        (curr-prev)/
        (1000*60*60*24);

      if(diff===1){

        current++;

        highest =
          Math.max(
            highest,
            current
          );

      }else{

        current = 1;

      }

    }

    return highest;

  };

  // HIGHEST STREAK EVER

  export const getHighestStreak = (
    library
  ) => {

    const dates = [];
    
    const lib = safeArray(library);
    lib.forEach((show) => {

      if (show.lastWatchedAt) {

        dates.push(
          new Date(show.lastWatchedAt)
            .toISOString()
            .split("T")[0]
        );

      }

      if (show.watchHistory) {

        show.watchHistory.forEach(
          (entry) => {

            if (entry.watchedAt) {

              dates.push(
                new Date(entry.watchedAt)
                  .toISOString()
                  .split("T")[0]
              );

            }

          }
        );

      }

    });

    const uniqueDates =
      [...new Set(dates)]
        .sort();

    if (!uniqueDates.length) {
      return 0;
    }

    let highest = 1;
    let current = 1;

    for (
      let i = 1;
      i < uniqueDates.length;
      i++
    ) {

      const prev =
        new Date(
          uniqueDates[i - 1]
        );

      const curr =
        new Date(
          uniqueDates[i]
        );

      const diff =
        (curr - prev) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) {

        current++;

        highest = Math.max(
          highest,
          current
        );

      } else {

        current = 1;

      }

    }

    return highest;

  };


  // MONTHLY MOVIES COMPLETED

  export const getMoviesCompletedThisMonth =
  (
    library
  ) => {

    const now = new Date();

    return library.filter(
      (show) => {

        if (
          show.type !== "movie" ||
          !show.completedAt
        ) {
          return false;
        }

        const completed =
          new Date(
            show.completedAt
          );

        return (
          completed.getMonth() ===
            now.getMonth() &&
          completed.getFullYear() ===
            now.getFullYear()
        );

      }
    ).length;

  };


  // MONTHLY SERIES COMPLETED

  export const getSeriesCompletedThisMonth =
  (
    library
  ) => {

    const now = new Date();

    return library.filter(
      (show) => {

        if (
          show.type !== "tv" ||
          !show.completedAt
        ) {
          return false;
        }

        const completed =
          new Date(
            show.completedAt
          );

        return (
          completed.getMonth() ===
            now.getMonth() &&
          completed.getFullYear() ===
            now.getFullYear()
        );

      }
    ).length;

  };


  // MONTHLY HOURS WATCHED

  export const getHoursWatchedThisMonth=(library)=>{

  const now=new Date();

  let totalMinutes=0;

  library.forEach((show)=>{

  const runtime=

  show.runtime>500

  ? Math.round(show.runtime/60)

  : show.runtime||0;

  if(show.type==="movie"){

  if(!show.completedAt){

  return;

  }

  const completed=

  new Date(

  show.completedAt

  );

  const sameMonth=

  completed.getMonth()===now.getMonth()

  &&

  completed.getFullYear()===now.getFullYear();

  if(sameMonth){

  totalMinutes+=runtime;

  }

  }

  if(show.type==="tv"){

  (show.watchHistory||[])

  .forEach((ep)=>{

  if(!ep.watchedAt){

  return;

  }

  const watched=

  new Date(

  ep.watchedAt

  );

  const sameMonth=

  watched.getMonth()===now.getMonth()

  &&

  watched.getFullYear()===now.getFullYear();

  if(sameMonth){

  totalMinutes+=runtime;

  }

  });

  }

  });

  return Math.round(

  totalMinutes/60

  );

  };

  // LIFETIME MOVIES COMPLETED

  export const getTotalMoviesCompleted =
  (
    library
  ) => {

    return library.filter(
      (show) =>
        show.type === "movie" &&
        show.completedAt
    ).length;

  };


  // LIFETIME SERIES COMPLETED

  export const getTotalSeriesCompleted =
  (
    library
  ) => {

    return library.filter(
      (show) =>
        show.type === "tv" &&
        show.completedAt
    ).length;

  };


  // LIFETIME TOTAL TITLES

  export const getTotalCompletedTitles =
  (
    library
  ) => {

    return library.filter(
      (show) =>
        show.completedAt
    ).length;

  };


  // LIFETIME HOURS WATCHED

  export const getTotalHoursWatched=(library)=>{

  let totalMinutes=0;

  library.forEach((show)=>{

  const runtime=

  show.runtime>500

  ? Math.round(show.runtime/60)

  : show.runtime||0;

  if(show.type==="movie"){

  if(show.completedAt){

  totalMinutes+=runtime;

  }

  }

  if(show.type==="tv"){

  const episodes=

  show.watchHistory?.length||0;

  totalMinutes+=

  episodes*runtime;

  }

  });

  return Math.round(

  totalMinutes/60

  );

  };


  export const getAverageRating = (

  library

  ) => {

  const ratings =

  library

  .filter(

  show=>show.userRating

  )

  .map(

  show=>show.userRating

  );

  if(

  !ratings.length

  ){

  return 0;

  }

  const total=

  ratings.reduce(

  (a,b)=>a+b,

  0

  );

  return (

  total/

  ratings.length

  ).toFixed(1);

  };



  export const getMostRewatched = (

  library

  )=>{

  if(

  !library.length

  ){

  return "None";

  }

  const sorted=[

  ...library

  ].sort(

  (a,b)=>

  (b.rewatchCount||0)-

  (a.rewatchCount||0)

  );

  return (

  sorted[0]?.title||

  "None"

  );

  };

  export const getHeatMap = (
    library,
    year = new Date().getFullYear()
  ) => {

    const activity = {};

    const lib = safeArray(library);
      lib.forEach((show) => {
      if (show.lastWatchedAt) {

        const watchedDate =
          new Date(show.lastWatchedAt);

        if (
          watchedDate.getFullYear() !== year
        ) {
          return;
        }

        const date =
          watchedDate
            .toISOString()
            .split("T")[0];

        activity[date] =
          (activity[date] || 0) + 1;
      }

      (show.watchHistory || [])
        .forEach((entry) => {

          if (!entry.watchedAt) {
            return;
          }

          const watchedDate =
            new Date(entry.watchedAt);

          if (
            watchedDate.getFullYear() !== year
          ) {
            return;
          }

          const date =
            watchedDate
              .toISOString()
              .split("T")[0];

          activity[date] =
            (activity[date] || 0) + 1;
        });

    });

    return activity;
  };

  export const getHeatmapData=
  (
  library
  )=>{

  let dates=[];

  library.forEach((show)=>{

    if(show.lastWatchedAt){

        dates.push(

        new Date(
        show.lastWatchedAt
        )

        .toISOString()

        .split("T")[0]

        );

    }

    show.watchHistory?.forEach(
    (ep)=>{

        if(ep.watchedAt){

          dates.push(

          new Date(
            ep.watchedAt
          )

          .toISOString()

          .split("T")[0]

          );

        }

    });

  });

  return dates;

  }; 

