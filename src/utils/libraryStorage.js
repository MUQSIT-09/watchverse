// src/utils/libraryStorage.js
import { auth } from "../firebase/firebase";
import { saveLibraryItem, getUserLibrary } from "../services/api";

const OFFLINE_QUEUE_KEY = "watchverse:offline-queue";

/**
 * Helpers: offline queue
 */
function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function writeQueue(q) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    console.warn("writeQueue failed", e);
  }
}

function enqueueOffline(payload) {
  try {
    const q = readQueue();
    q.push({ payload, createdAt: new Date().toISOString() });
    writeQueue(q);
  } catch (e) {
    console.warn("Failed to enqueue offline payload", e);
  }
}

/**
 * Try to flush offline queue. Will keep items that fail.
 */
export async function flushOfflineQueue() {
  try {
    const q = readQueue();
    if (!q.length) return;
    const remaining = [];
    for (const item of q) {
      try {
        await saveLibraryItem(item.payload);
      } catch (err) {
        remaining.push(item);
      }
    }
    writeQueue(remaining);
    if (!remaining.length) {
      // notify UI to reload library
      window.dispatchEvent(new Event("watchverse:libraryUpdated"));
    }
  } catch (e) {
    console.warn("Failed flushing offline queue", e);
  }
}

/**
 * getLibrary(uid) - robust fetch via API wrapper
 * returns the array (or [])
 */
export const getLibrary = async (uid) => {
  try {
    const res = await getUserLibrary(uid);
    // safe parse result shape:
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.library)) return res.library;
    // some endpoints return { data: [...] }
    // else attempt to find array anywhere
    const arr = Object.values(res).find((v) => Array.isArray(v));
    return arr || [];
  } catch (err) {
    console.log("getLibrary error:", err);
    return [];
  }
};

/**
 * addToLibrary(show) - send to backend; if it fails enqueue for offline sync.
 * Ensures lastWatchedAt fallback is set.
 */
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
    tmdbRating: show.tmdbRating ?? null,
    imdbId: show.imdbId ?? null,
    imdbRating: show.imdbRating ?? null,
    overview: show.overview ?? "",
    genres: show.genres ?? [],
    year: show.year ?? "",
    cast: show.cast ?? [],
    // prefer explicit lastWatchedAt; fallback to last watchHistory entry if present
    lastWatchedAt:
      show.lastWatchedAt ??
      (Array.isArray(show.watchHistory) && show.watchHistory.slice(-1)[0]?.watchedAt) ??
      null,
  };

  console.log("FINAL PAYLOAD", payload);

  try {
    const res = await saveLibraryItem(payload);
    // notify other components to reload
    window.dispatchEvent(new Event("watchverse:libraryUpdated"));
    return res;
  } catch (err) {
    console.warn("Remote save failed, enqueueing for offline sync:", err);
    enqueueOffline(payload);
    window.dispatchEvent(new Event("watchverse:libraryUpdated"));
    return { queued: true };
  }
};