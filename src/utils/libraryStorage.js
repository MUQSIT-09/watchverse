
import { auth } from "../firebase/firebase";
import { saveLibraryItem } from "../services/api";

// =========================
// GET LIBRARY FROM BACKEND
// =========================
export const getLibrary = async (uid) => {
  try {
    const res = await fetch(`http://localhost:5000/api/library/${uid}`);
    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.library)) return data.library;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  } catch (err) {
    console.log("getLibrary error:", err);
    return [];
  }
};
// =========================
// ADD / UPDATE LIBRARY ITEM
// =========================

export const addToLibrary = async (show) => {
  if (!auth.currentUser) {
    throw new Error("Login Required");
  }

  const uid = auth.currentUser.uid;

  const payload = {
    ...show,

    firebaseUid: uid,
    tmdbId: show.tmdbId || show.id,

    status: show.status,
    isFavorite: show.isFavorite ?? false,

    currentTime: show.currentTime ?? 0,
    currentMinute: show.currentMinute ?? 0,

    userReview: show.userReview ?? "",
    userRating: show.userRating ?? null,
    sentiment: show.sentiment ?? "",

    watchHistory: show.watchHistory ?? [],
    episodeRatings: show.episodeRatings ?? {},
    episodeReviews: show.episodeReviews ?? {},
    seasonHistory: show.seasonHistory ?? {},

    watchedEpisodes: show.watchedEpisodes ?? 0,
    totalEpisodes: show.totalEpisodes ?? 1,

    currentSeason: show.currentSeason ?? 1,
    currentEpisode: show.currentEpisode ?? 1,
    totalSeasons: show.totalSeasons ?? 1,

    runtime: show.runtime ?? 0,
    duration: show.duration ?? 0,

    seasons: show.seasons ?? [],

    queuePosition: show.queuePosition ?? 1,

    tmdbRating: show.tmdbRating,
    imdbId: show.imdbId,
    imdbRating: show.imdbRating,
    overview: show.overview,
    genres: show.genres ?? [],
    year: show.year,
    cast: show.cast ?? [],
  };

  console.log("FINAL PAYLOAD");
  console.log(payload);

  return await saveLibraryItem(payload);
};


