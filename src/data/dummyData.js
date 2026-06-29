export const stats = [
  {
    title: "Movies Watched",
    value: 124,
  },
  {
    title: "Episodes Watched",
    value: 1382,
  },
  {
    title: "Hours Watched",
    value: 924,
  },
  {
    title: "Series Completed",
    value: 47,
  },
];

export const continueWatching = [
  {
    title: "The Boys",
    progress: "S04 E06",
  },
  {
    title: "House of the Dragon",
    progress: "S02 E03",
  },
  {
    title: "Panchayat",
    progress: "S03 E05",
  },
];

export const watchlist = [
  {
    title: "Mehmed: Fetihler Sultan",
    year: 2024,
  },
  {
    title: "House of the Dragon",
    year: 2024,
  },
  {
    title: "Stranger Things 5",
    year: 2026,
  },
];

export const recentActivity = [
  {
    title: "The Boys",
    episode: "S04E06",
    rating: "9/10",
  },
  {
    title: "Panchayat",
    episode: "S03E05",
    rating: "8/10",
  },
  {
    title: "House of the Dragon",
    episode: "S02E03",
    rating: "9/10",
  },
];

export const libraryShows = [
  {
    id: 1,
    title: "Breaking Bad",
    year: 2008,
    type: "Series",
    status: "plan",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 9.5,
    queuePosition: 1,
    priority: 3,
    totalEpisodes: 62,
    isFavorite: true,
    userReview: "",
  },
  {
    id: 2,
    title: "Mehmed: Fetihler Sultan",
    year: 2024,
    type: "Series",
    status: "watching",
    poster:
      "https://images.unsplash.com/photo-1541795795328-f073b763494e?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.2,
    queuePosition: 2,
    priority: 3,
    totalEpisodes: 30,
    watchedEpisodes: 15,
    currentEpisode: "S01 E15",
    startedAt: "2026-06-10",
    lastWatchedAt: "2026-06-16T22:20:00",
    nextEpisode: {
      episode: "S01 E16",
      releaseDate: "2026-06-20",
      releaseTime: "8:00 PM",
    },
    isFavorite: true,
    userReview: "",
    overview:
      "A historical drama following Mehmed's rise, court politics, military pressure, and the personal cost of conquest.",
    episodes: [
      { number: 1, title: "Episode 1", watched: true },
      { number: 2, title: "Episode 2", watched: true },
      { number: 3, title: "Episode 3", watched: true },
      { number: 4, title: "Episode 4", watched: false },
      { number: 5, title: "Episode 5", watched: false },
    ],
    history: [
      {
        episode: "E1",
        action: "Watched E1",
        date: "2026-06-15",
        time: "9:15 PM",
      },
      {
        episode: "E2",
        action: "Watched E2",
        date: "2026-06-16",
        time: "10:20 PM",
      },
    ],
    episodeNotes: [
      {
        episode: "S01 E15",
        note: "The episode pushes the conquest story forward and gives us a clear point for our own review conclusion.",
      },
    ],
  },
  {
    id: 3,
    title: "The Boys",
    year: 2019,
    type: "Series",
    status: "watching",
    poster:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.7,
    startedAt: "2026-06-05",
    lastWatchedAt: "2026-06-14",
    currentEpisode: "S04 E06",
    totalEpisodes: 32,
    watchedEpisodes: 30,
    nextEpisode: {
      episode: "S04 E07",
      releaseDate: "2026-06-21",
      releaseTime: "9:00 PM",
    },
    isFavorite: true,
    userReview: "",
    episodeNotes: [
      {
        episode: "S04 E04",
        note: "Power shifts inside the team; the season starts pointing toward a heavier ending.",
      },
      {
        episode: "S04 E06",
        note: "The latest watch raises the stakes and leaves the next episode feeling important.",
      },
    ],
  },
  {
    id: 4,
    title: "Panchayat",
    year: 2020,
    type: "Series",
    status: "completed",
    poster:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.9,
    startedAt: "2026-05-22",
    lastWatchedAt: "2026-06-02",
    completedAt: "2026-06-02",
    currentEpisode: "S03 E08",
    totalEpisodes: 24,
    watchedEpisodes: 24,
    isFavorite: true,
    userReview: "",
    episodeNotes: [
      {
        episode: "S03 E05",
        note: "Small-town pressure builds around the main decision and changes the mood of the season.",
      },
      {
        episode: "S03 E08",
        note: "The finale closes the season emotionally while leaving enough tension for what comes next.",
      },
    ],
  },
  {
    id: 5,
    title: "House of the Dragon",
    year: 2022,
    type: "Series",
    status: "on_hold",
    poster:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.4,
    startedAt: "2026-06-08",
    lastWatchedAt: "2026-06-13",
    currentEpisode: "S02 E03",
    totalEpisodes: 18,
    watchedEpisodes: 13,
    nextEpisode: {
      episode: "S02 E04",
      releaseDate: "2026-07-03",
      releaseTime: "6:30 PM",
    },
    isFavorite: false,
    userReview: "",
    episodeNotes: [
      {
        episode: "S02 E03",
        note: "The conflict becomes more personal, so the next watch should continue from this tension.",
      },
    ],
  },
  {
    id: 6,
    title: "Dark",
    year: 2017,
    type: "Series",
    status: "plan",
    poster:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.8,
    queuePosition: 6,
    priority: 2,
    totalEpisodes: 26,
    isFavorite: false,
    userReview: "",
  },
  {
    id: 7,
    title: "The Witcher",
    year: 2019,
    type: "Series",
    status: "dropped",
    poster:
      "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80",
    tmdbRating: 8.0,
    startedAt: "2026-04-02",
    lastWatchedAt: "2026-04-11",
    currentEpisode: "S02 E03",
    totalEpisodes: 24,
    watchedEpisodes: 11,
    isFavorite: false,
    userReview: "",
    episodeNotes: [
      {
        episode: "S02 E03",
        note: "Stopped here. If restarted later, continue from this episode summary.",
      },
    ],
  },
];

export const calendarEvents = [
  {
    date: "2026-01-12",
    day: 12,
    title: "Paatal Lok E2",
    type: "Episode",
    status: "Watched",
  },
  {
    date: "2026-02-09",
    day: 9,
    title: "The Last Kingdom",
    type: "Series",
    status: "Started",
  },
  {
    date: "2026-03-18",
    day: 18,
    title: "Dark E1",
    type: "Episode",
    status: "Planned",
  },
  {
    date: "2026-04-11",
    day: 11,
    title: "The Witcher S2 E3",
    type: "Episode",
    status: "Dropped",
  },
  {
    date: "2026-05-22",
    day: 22,
    title: "Panchayat",
    type: "Series",
    status: "Started",
  },
  {
    date: "2026-06-15",
    day: 15,
    title: "Interstellar",
    type: "Movie",
    status: "Watched",
  },
  {
    date: "2026-06-16",
    day: 16,
    title: "Mehmed E15",
    type: "Episode",
    status: "Watched",
  },
  {
    date: "2026-06-17",
    day: 17,
    title: "Farzi E6",
    type: "Episode",
    status: "Watched",
  },
  {
    date: "2026-08-14",
    day: 14,
    title: "Historical Drama Night",
    type: "Mood",
    status: "Planned",
  },
  {
    date: "2026-10-04",
    day: 4,
    title: "Breaking Bad",
    type: "Series",
    status: "Planned",
  },
  {
    date: "2026-12-27",
    day: 27,
    title: "Year End Watch Review",
    type: "Review",
    status: "Planned",
  },
];

export const upcomingEvents = [
  {
    date: "2026-06-20",
    label: "20 June",
    title: "Mehmed E16",
    type: "Upcoming episode",
  },
  {
    date: "2026-06-21",
    label: "21 June",
    title: "Anime Episode",
    type: "Upcoming episode",
  },
];

export const profileStats = [
  { title: "Movies Watched", value: 124 },
  { title: "Series Completed", value: 47 },
  { title: "Watch Time", value: "924h" },
  { title: "Favorite Genre", value: "Historical Drama" },
  { title: "Longest Binge", value: "7 episodes" },
  { title: "Average Episodes Per Day", value: "2.8" },
];
