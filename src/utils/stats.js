// src/utils/stats.js
// Full, backward-compatible stats utilities for WatchVerse
// Exports many functions used across the app (same names as before).

const safeArray = (data) => (Array.isArray(data) ? data : []);

/**
 * normalizeRuntime(showOrRuntime)
 * - If passed a show object, tries show.runtime or show.duration
 * - If runtime looks like minutes (<=500) treat as minutes and convert to seconds
 * - If runtime > 500 treat as seconds already
 * - Returns integer seconds (0 if missing/invalid)
 */
export const normalizeRuntime = (showOrRuntime) => {
  let runtime = 0;
  if (typeof showOrRuntime === "object" && showOrRuntime !== null) {
    runtime = Number(showOrRuntime.runtime ?? showOrRuntime.duration ?? 0);
  } else {
    runtime = Number(showOrRuntime ?? 0);
  }
  if (!runtime || isNaN(runtime)) return 0;
  // heuristics: if number > 500 assume seconds (realistic movie seconds > 500)
  // else assume minutes and convert
  return runtime > 500 ? Math.round(runtime) : Math.round(runtime * 60);
};

/* ---------------------------
   Date helpers
   --------------------------- */
const toIsoDateKey = (isoOrDate) => {
  if (!isoOrDate) return null;
  const d = new Date(isoOrDate);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

/* ---------------------------
   Gather watched dates (unique, sorted desc)
   --------------------------- */
const gatherWatchedDateKeys = (library) => {
  const keys = [];
  safeArray(library).forEach((show) => {
    const k1 = toIsoDateKey(show.lastWatchedAt);
    if (k1) keys.push(k1);
    safeArray(show.watchHistory).forEach((ep) => {
      const k = toIsoDateKey(ep.watchedAt);
      if (k) keys.push(k);
    });
  });
  // unique & sort desc (newest first)
  const unique = [...new Set(keys)].sort().reverse();
  return unique;
};

/* ---------------------------
   Streaks
   --------------------------- */

export const getCurrentStreak = (library) => {
  const unique = gatherWatchedDateKeys(library);
  if (!unique.length) return 0;

  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i]);
    const next = new Date(unique[i + 1]);
    const diff = Math.round((curr - next) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

export const getHighestStreak = (library) => {
  // compute on entire timeline (ascending)
  const asc = [...new Set(gatherWatchedDateKeys(library))].sort();
  if (!asc.length) return 0;
  let highest = 1;
  let current = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const curr = new Date(asc[i]);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      highest = Math.max(highest, current);
    } else {
      current = 1;
    }
  }
  return highest;
};

/* monthly streak utilities */
export const getCurrentMonthStreak = (library) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const dates = [];
  safeArray(library).forEach((show) => {
    const k = toIsoDateKey(show.lastWatchedAt);
    if (k) {
      const d = new Date(k);
      if (d.getMonth() === month && d.getFullYear() === year) dates.push(k);
    }
    safeArray(show.watchHistory).forEach((ep) => {
      const ke = toIsoDateKey(ep.watchedAt);
      if (ke) {
        const d = new Date(ke);
        if (d.getMonth() === month && d.getFullYear() === year) dates.push(ke);
      }
    });
  });

  const unique = [...new Set(dates)].sort().reverse();
  if (!unique.length) return 0;

  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i]);
    const next = new Date(unique[i + 1]);
    const diff = Math.round((curr - next) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

export const getHighestMonthStreak = (library) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const dates = [];
  safeArray(library).forEach((show) => {
    const k = toIsoDateKey(show.lastWatchedAt);
    if (k) {
      const d = new Date(k);
      if (d.getMonth() === month && d.getFullYear() === year) dates.push(k);
    }
    safeArray(show.watchHistory).forEach((ep) => {
      const ke = toIsoDateKey(ep.watchedAt);
      if (ke) {
        const d = new Date(ke);
        if (d.getMonth() === month && d.getFullYear() === year) dates.push(ke);
      }
    });
  });

  const unique = [...new Set(dates)].sort();
  if (!unique.length) return 0;

  let highest = 1;
  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      highest = Math.max(highest, current);
    } else {
      current = 1;
    }
  }
  return highest;
};

/* ---------------------------
   Heatmap / Activity
   --------------------------- */
export const getHeatMap = (library, year = new Date().getFullYear()) => {
  const activity = {};
  safeArray(library).forEach((show) => {
    const pushIfYear = (iso) => {
      const k = toIsoDateKey(iso);
      if (!k) return;
      const d = new Date(k);
      if (d.getFullYear() !== Number(year)) return;
      activity[k] = (activity[k] || 0) + 1;
    };
    pushIfYear(show.lastWatchedAt);
    safeArray(show.watchHistory).forEach((ep) => pushIfYear(ep.watchedAt));
  });
  return activity;
};

export const getHeatmapData = (library) => {
  const dates = [];
  safeArray(library).forEach((show) => {
    const k = toIsoDateKey(show.lastWatchedAt);
    if (k) dates.push(k);
    safeArray(show.watchHistory).forEach((ep) => {
      const ke = toIsoDateKey(ep.watchedAt);
      if (ke) dates.push(ke);
    });
  });
  return dates;
};

/* ---------------------------
   Monthly / Lifetime counts & hours
   --------------------------- */

export const getMoviesCompletedThisMonth = (library) => {
  const now = new Date();
  return safeArray(library).filter((show) => {
    if (show.type !== "movie" || !show.completedAt) return false;
    const d = new Date(show.completedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
};

export const getSeriesCompletedThisMonth = (library) => {
  const now = new Date();
  return safeArray(library).filter((show) => {
    if (show.type !== "tv" || !show.completedAt) return false;
    const d = new Date(show.completedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
};

export const getHoursWatchedThisMonth = (library) => {
  const now = new Date();
  let totalMinutes = 0;
  safeArray(library).forEach((show) => {
    const runtimeSeconds = normalizeRuntime(show);
    const runtimeMinutes = Math.round(runtimeSeconds / 60);
    if (show.type === "movie") {
      if (!show.completedAt) return;
      const d = new Date(show.completedAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        totalMinutes += runtimeMinutes;
      }
    } else if (show.type === "tv") {
      safeArray(show.watchHistory).forEach((ep) => {
        if (!ep.watchedAt) return;
        const d = new Date(ep.watchedAt);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          totalMinutes += runtimeMinutes;
        }
      });
    }
  });
  return Math.round(totalMinutes / 60);
};

export const getTotalMoviesCompleted = (library) =>
  safeArray(library).filter((s) => s.type === "movie" && s.completedAt).length;

export const getTotalSeriesCompleted = (library) =>
  safeArray(library).filter((s) => s.type === "tv" && s.completedAt).length;

export const getTotalCompletedTitles = (library) =>
  safeArray(library).filter((s) => s.completedAt).length;

export const getTotalHoursWatched = (library) => {
  let totalMinutes = 0;
  safeArray(library).forEach((show) => {
    const runtimeSeconds = normalizeRuntime(show);
    const runtimeMinutes = Math.round(runtimeSeconds / 60);
    if (show.type === "movie") {
      if (show.completedAt) totalMinutes += runtimeMinutes;
    } else if (show.type === "tv") {
      const episodes = safeArray(show.watchHistory).filter((ep) => ep.watchedAt).length;
      totalMinutes += episodes * runtimeMinutes;
    }
  });
  return Math.round(totalMinutes / 60);
};

/* ---------------------------
   Ratings & misc
   --------------------------- */
export const getAverageRating = (library) => {
  const ratings = safeArray(library).filter((s) => s.userRating).map((s) => s.userRating);
  if (!ratings.length) return 0;
  const total = ratings.reduce((a, b) => a + b, 0);
  return (total / ratings.length).toFixed(1);
};

export const getMostRewatched = (library) => {
  const lib = safeArray(library);
  if (!lib.length) return "None";
  const sorted = [...lib].sort((a, b) => (b.rewatchCount || 0) - (a.rewatchCount || 0));
  return sorted[0]?.title || "None";
};

/* export */
export default {
  safeArray,
  normalizeRuntime,
  getHeatMap,
  getHeatmapData,
  getCurrentStreak,
  getHighestStreak,
  getHighestMonthStreak,
  getCurrentMonthStreak,
  getHoursWatchedThisMonth,
  getTotalHoursWatched,
  getMoviesCompletedThisMonth,
  getSeriesCompletedThisMonth,
  getTotalMoviesCompleted,
  getTotalSeriesCompleted,
  getTotalCompletedTitles,
  getAverageRating,
  getMostRewatched,
};