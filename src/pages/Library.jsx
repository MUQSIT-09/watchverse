// Library.jsx
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3, NotebookText, Save } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import FilterTabs from "../components/library/FilterTabs";
import ShowGrid from "../components/library/ShowGrid";
import { Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { formatTime, getRuntimeSeconds } from "../utils/formatTime";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { normalizeRuntime } from "../utils/stats";
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { getLibrary, addToLibrary } from "../utils/libraryStorage";
import { getPosterUrl } from "../utils/getPosterUrl";

const filterShows = (shows, activeTab) => {
  if (activeTab === "favorites") {
    return shows.filter((show) => show.isFavorite);
  }

  return shows.filter((show) => show.status === activeTab);
};

const formatDate = (value) => {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const loadSavedReviews = () => {
  try {
    return JSON.parse(localStorage.getItem("watchverse:user-reviews")) || {};
  } catch {
    return {};
  }
};

const loadTabOrders = () => {
  try {
    return JSON.parse(localStorage.getItem("watchverse-tab-orders")) || {};
  } catch {
    return {};
  }
};

const ShowDetails = ({
  show,
  activeTab,
  updateShowStatus,
  updateEpisodeProgress,
  removeFavorite,
  updateSentiment,
  updateTime,
  updateEpisodeReview,
  showRatingPad,
  setShowRatingPad,
  updateEpisodeRating,
  updateShowRating,
  showMovieRatingPad,
  setShowMovieRatingPad,
  showMovieReviewPad,
  setShowMovieReviewPad,
  updateMovieReview,
  movieReview,
  setMovieReview,
  reviewMode,
  jumpToEpisode,
  finishSeason,
  setReviewMode,
}) => {
  if (!show) {
    return null;
  }

  const currentSeasonData = show.seasons?.find(
    (s) => s.seasonNumber === show.currentSeason,
  );

  const maxEpisode = currentSeasonData?.episodeCount || 1;

  const isFirstEpisode = show.currentSeason === 1 && show.currentEpisode === 1;
  const currentSeasonEpisodes =
    show.seasons?.find((s) => s.seasonNumber === show.currentSeason)
      ?.episodeCount || 1;

  const isSeasonLastEpisode = show.currentEpisode === currentSeasonEpisodes;

  const isSeriesLastEpisode =
    show.currentSeason === show.totalSeasons && isSeasonLastEpisode;

  const currentEpisodeStarted = (show.watchHistory || []).some(
    (ep) =>
      ep.season === show.currentSeason && ep.episode === show.currentEpisode,
  );

  const waitingForSeasonStart = show.waitingForSeasonStart;

  const [selectedEpisodeKey, setSelectedEpisodeKey] = useState(null);
  const selectedEpisode =
    show.watchHistory?.find(
      (ep) =>
        ep.season === selectedEpisodeKey?.season &&
        ep.episode === selectedEpisodeKey?.episode,
    ) || null;
  const [selectedSeason, setSelectedSeason] = useState(show.currentSeason || 1);

  const [showReviewPad, setShowReviewPad] = useState(false);
  const [showReadOnlyReview, setShowReadOnlyReview] = useState(false);
  const [ratingWhole, setRatingWhole] = useState(null);
  const [showEpisodeRatingPad, setShowEpisodeRatingPad] = useState(false);
  const [showEpisodeReviewPad, setShowEpisodeReviewPad] = useState(false);

  useEffect(() => {
    setMovieReview(show.userReview || "");
  }, [show.id]);


  const isMovie = show?.type === "movie";

  const seasonList = Array.from(
    { length: show.totalSeasons },
    (_, i) => i + 1,
  );

  const selectedSeasonData = show.seasons?.find(
    (s) => s.seasonNumber === selectedSeason,
  );

  const ratedEpisodes = (show.watchHistory || []).filter((ep) => ep.rating > 0);

  const averageEpisodeRating =
    ratedEpisodes.length > 0
      ? (
          ratedEpisodes.reduce((sum, ep) => sum + ep.rating, 0) /
          ratedEpisodes.length
        ).toFixed(1)
      : null;

  const hideActionsInFavorites =
    activeTab === "favorites" && show.status === "completed";

  const hideActionsInCompleted = activeTab === "completed";

  return (
    <aside
      className="
    w-full
    xl:w-[420px]
    xl:sticky
    xl:top-4
    xl:max-h-[90vh]
    xl:overflow-y-auto
    scrollbar-hide
    rounded-3xl
    border
    border-slate-800
    bg-slate-900
    p-4
    sm:p-6
    space-y-4
  "
    >
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">{show.title}</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          {show.type} • {show.year}
        </p>

        <p className="mt-1 font-semibold text-amber-300 text-sm">
          ⭐ {Number(show.tmdbRating || 0).toFixed(1)}
        </p>
      </div>

      {/* Sentiment Badge */}
      <div className="space-y-2">
        {show.sentiment === "masterpiece" && (
          <span className="inline-block rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
            👑 Masterpiece
          </span>
        )}

        {show.sentiment === "underrated" && (
          <span className="inline-block rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">
            💎 Underrated
          </span>
        )}

        {show.sentiment === "average" && (
          <span className="inline-block rounded-full bg-slate-500/20 px-2 py-1 text-xs text-slate-300">
            😐 Average
          </span>
        )}

        {show.sentiment === "overrated" && (
          <span className="inline-block rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300">
            📉 Overrated
          </span>
        )}

        {show.sentiment === "guilty_pleasure" && (
          <span className="inline-block rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300">
            🍿 Guilty Pleasure
          </span>
        )}

        {show.sentiment === "one_time_watch" && (
          <span className="inline-block rounded-full bg-orange-500/20 px-2 py-1 text-xs text-orange-300">
            🎬 One-Time Watch
          </span>
        )}
      </div>

      {/* Sentiment Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <button onClick={() => updateSentiment(show.id, "masterpiece")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "masterpiece" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          👑 Masterpiece
        </button>
        <button onClick={() => updateSentiment(show.id, "underrated")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "underrated" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          💎 Underrated
        </button>
        <button onClick={() => updateSentiment(show.id, "average")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "average" ? "bg-slate-500/20 text-slate-300 border-slate-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          😐 Average
        </button>
        <button onClick={() => updateSentiment(show.id, "overrated")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "overrated" ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          📉 Overrated
        </button>
        <button onClick={() => updateSentiment(show.id, "guilty_pleasure")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "guilty_pleasure" ? "bg-pink-500/20 text-pink-400 border-pink-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          🍿 Guilty Pleasure
        </button>
        <button onClick={() => updateSentiment(show.id, "one_time_watch")} className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] sm:text-[11px] font-bold transition truncate ${show.sentiment === "one_time_watch" ? "bg-orange-500/20 text-orange-400 border-orange-500/40" : "bg-slate-800/40 border-slate-800 text-slate-400"}`}>
          🎬 One Time Watch
        </button>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-1.5">
        {show.isFavorite && (
          <span className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-red-300">
            ❤️ Favorite
          </span>
        )}

        {show.status === "watching" && (
          <span className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-sky-300">
            🔥 Watching
          </span>
        )}

        {show.status === "completed" && (
          <span className="rounded-lg bg-green-500/10 border border-green-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-green-300">
            🎯 Finished
          </span>
        )}

        {show.status === "on_hold" && (
          <span className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-yellow-300">
            ⏸ On Hold
          </span>
        )}

        {show.status === "dropped" && (
          <span className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-red-300">
            ❌ Dropped
          </span>
        )}

        {show.rewatchCount > 0 && (
          <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-purple-300">
            🔁 {show.rewatchCount}x
          </span>
        )}

        {show.status === "plan" && (
          <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-[10px] sm:text-xs font-semibold text-blue-300">
            📌 Plan To Watch
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 w-full pt-2">
        {(show.status === "plan" ||
          show.status === "watching" ||
          show.status === "completed") && (
          <>
            {!hideActionsInFavorites && !hideActionsInCompleted && (
              <>
                <button
                  onClick={() => updateShowStatus(show.id, "completed")}
                  className="rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm font-bold py-2 px-1 transition flex items-center justify-center gap-0.5"
                >
                  ✅ Done
                </button>

                <button
                  onClick={() => updateShowStatus(show.id, "on_hold")}
                  className="rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-xs sm:text-sm font-bold py-2 px-1 transition flex items-center justify-center gap-0.5"
                >
                  ⏸ Hold
                </button>

                <button
                  onClick={() => updateShowStatus(show.id, "dropped")}
                  className="col-span-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold py-2 px-1 transition flex items-center justify-center gap-0.5"
                >
                  ❌ Dropped
                </button>
              </>
            )}

            {show.isFavorite && (
              <button
                onClick={() => removeFavorite(show.id)}
                className="col-span-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold py-2"
              >
                💔 Remove Favorite
              </button>
            )}

            {/* TV Show Watch History & Controls */}
            {show.type === "tv" && (
              <div className="col-span-2 space-y-3 pt-2">
                {/* Watch History */}
                <div className="rounded-lg bg-slate-800 p-3">
                  <h3 className="font-semibold text-sky-300 text-xs sm:text-sm mb-2">📺 Watch History</h3>

                  <div
                    className={`space-y-1 ${
                      (show.watchHistory?.length || 0) > 3
                        ? "max-h-24 overflow-y-auto scrollbar-hide border border-slate-700 p-2 rounded"
                        : ""
                    }`}
                  >
                    {show.watchHistory?.length > 0 ? (
                      show.watchHistory
                        .slice()
                        .reverse()
                        .map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedEpisodeKey({
                                season: item.season,
                                episode: item.episode,
                              });
                              jumpToEpisode(show.id, item.season, item.episode);
                            }}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-left text-xs transition hover:border-cyan-500 hover:bg-slate-800"
                          >
                            S{item.season}E{item.episode}
                          </button>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400">No episodes yet</p>
                    )}
                  </div>
                </div>

                {/* Continue Watching */}
                {(show.status === "watching" || show.status === "rewatch") && (
                  <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <h3 className="text-sky-300 font-semibold text-xs sm:text-sm">📺 Continue Watching</h3>

                    <div className="bg-slate-950/40 py-2 rounded-lg border border-slate-900 text-center">
                      <p className="text-lg sm:text-2xl font-black text-white">
                        S{show.currentSeason} E{show.currentEpisode}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{formatTime(show.currentTime || 0)}</span>
                        <span>{formatTime(getRuntimeSeconds(show))}</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={getRuntimeSeconds(show)}
                        value={show.currentTime || 0}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          const difference = newValue - (show.currentTime || 0);
                          updateTime(show.id, difference);
                        }}
                        className="w-full cursor-pointer accent-cyan-500 h-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => updateEpisodeProgress(show.id, "decrease")}
                        disabled={isFirstEpisode}
                        className={`rounded-lg py-2 font-bold text-xs transition border ${
                          isFirstEpisode
                            ? "bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed"
                            : "bg-slate-700 hover:bg-slate-600 border-transparent text-white"
                        }`}
                      >
                        ◀ Prev
                      </button>

                      <button
                        onClick={() => {
                          if (waitingForSeasonStart || !currentEpisodeStarted) {
                            updateEpisodeProgress(show.id, "start");
                            return;
                          }
                          if (isSeriesLastEpisode) {
                            updateShowStatus(show.id, "completed");
                            return;
                          }
                          if (isSeasonLastEpisode) {
                            finishSeason(show.id);
                            return;
                          }
                          updateEpisodeProgress(show.id, "increase");
                        }}
                        className={`rounded-lg py-2 font-bold text-xs transition border border-transparent text-slate-950 ${
                          isSeasonLastEpisode
                            ? "bg-green-500 hover:bg-green-400"
                            : !currentEpisodeStarted
                            ? "bg-amber-500 hover:bg-amber-400"
                            : "bg-cyan-500 hover:bg-cyan-400"
                        }`}
                      >
                        {waitingForSeasonStart || !currentEpisodeStarted
                          ? "▶ Start"
                          : isSeasonLastEpisode
                          ? "🏁 Finish"
                          : "Next ▶"}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700/40 space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Series Progress</span>
                        <span className="text-cyan-400">{show.watchHistory?.length || 0}/{show.totalEpisodes}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all"
                          style={{
                            width: `${((show.watchHistory?.length || 0) / show.totalEpisodes) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Episode Details & Rating */}
                {selectedEpisode && (
                  <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <h4 className="font-semibold text-cyan-300 text-xs sm:text-sm">
                      📺 S{selectedEpisode.season}E{selectedEpisode.episode}
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowEpisodeRatingPad(true)}
                        className="rounded-lg bg-amber-500/20 py-2 text-amber-300 text-xs font-bold"
                      >
                        {selectedEpisode?.rating
                          ? `⭐ ${selectedEpisode.rating.toFixed(1)}`
                          : "⭐ Rate"}
                      </button>

                      {!selectedEpisode.review ? (
                        <button
                          onClick={() => {
                            setReviewMode("edit");
                            setShowEpisodeReviewPad(true);
                          }}
                          className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 text-xs font-bold"
                        >
                          📝 Review
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setReviewMode("view");
                              setShowEpisodeReviewPad(true);
                            }}
                            className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 text-xs font-bold"
                          >
                            👁 View
                          </button>

                          <button
                            onClick={() => {
                              setReviewMode("edit");
                              setShowEpisodeReviewPad(true);
                            }}
                            className="rounded-lg bg-yellow-500/20 py-2 text-yellow-300 text-xs font-bold"
                          >
                            ✏️ Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Season Info & Review (rating removed) */}
                <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                  <h3 className="font-semibold text-cyan-300 text-xs sm:text-sm">📚 Season</h3>

                  <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
                    {seasonList.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSeason(s)}
                        className={`px-2 py-1 rounded-lg text-xs whitespace-nowrap font-bold ${
                          selectedSeason === s
                            ? "bg-cyan-500 text-black"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        S{s}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">📺 {selectedSeasonData?.episodeCount} Episodes</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">📅 Started</span>
                      <span className="text-slate-300">
                        {show.seasonHistory?.[selectedSeason]?.startedAt
                          ? formatDate(show.seasonHistory[selectedSeason].startedAt)
                          : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">🏁 Completed</span>
                      <span className="text-slate-300">
                        {show.seasonHistory?.[selectedSeason]?.completedAt
                          ? formatDate(show.seasonHistory[selectedSeason].completedAt)
                          : "Ongoing"}
                      </span>
                    </div>
                  </div>

                  {/* Season Review Button (rating removed, single-column layout) */}
                  {/* <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-700/40">
                    {!show.seasonHistory?.[selectedSeason]?.review ? (
                      <button
                        onClick={() => {
                          setSeasonReviewMode("edit");
                          setShowSeasonReviewPad(true);
                        }}
                        className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 text-xs font-bold"
                      >
                        📝 Write
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSeasonReviewMode("view");
                          setShowSeasonReviewPad(true);
                        }}
                        className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 text-xs font-bold"
                      >
                        👁 View
                      </button>
                    )}
                  </div> */}
                </div>
              </div>
            )}

            {/* Movie Details */}
            {show.type === "movie" && (
              <div className="col-span-2 space-y-3 pt-2">
                {["watching", "on_hold"].includes(show.status) && (
                  <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <h3 className="text-sky-300 font-semibold text-xs sm:text-sm">
                      🎬 Continue Watching
                    </h3>

                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {formatTime(show.currentTime || 0)}
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{formatTime(show.currentTime || 0)}</span>
                        <span>{formatTime(getRuntimeSeconds(show))}</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={getRuntimeSeconds(show)}
                        value={show.currentTime || 0}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          updateTime(show.id, newValue - (show.currentTime || 0));
                        }}
                        className="w-full accent-cyan-500 h-1"
                      />
                    </div>
                  </div>
                )}

                {show.status !== "dropped" && (
                  <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                    <h3 className="font-semibold text-cyan-300 text-xs sm:text-sm">
                      🎬 Movie Details
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">📅 Started</span>
                        <span>
                          {show.startedAt
                            ? formatDate(show.startedAt)
                            : "Not Started"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">🏁 Finished</span>
                        <span>
                          {show.completedAt
                            ? formatDate(show.completedAt)
                            : "Ongoing"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">⏱ Runtime</span>
                        <span>{formatTime(getRuntimeSeconds(show))}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">🔁 Rewatches</span>
                        <span>{show.rewatchCount || 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40">
                      <button
                        onClick={() => setShowMovieRatingPad(true)}
                        className="rounded-lg bg-amber-500/20 py-2 text-amber-300 font-bold text-xs"
                      >
                        {show.userRating
                          ? `⭐ ${Number(show.userRating).toFixed(1)}`
                          : "⭐ Rate"}
                      </button>

                      {!show.userReview ? (
                        <button
                          onClick={() => {
                            setMovieReview(show.userReview || "");
                            setReviewMode("edit");
                            setShowMovieReviewPad(true);
                          }}
                          className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 font-bold text-xs"
                        >
                          📝 Write
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setMovieReview(show.userReview || "");
                              setReviewMode("view");
                              setShowMovieReviewPad(true);
                            }}
                            className="rounded-lg bg-cyan-500/20 py-2 text-cyan-300 font-bold text-xs"
                          >
                            👁 View
                          </button>

                          <button
                            onClick={() => {
                              setMovieReview(show.userReview || "");
                              setReviewMode("edit");
                              setShowMovieReviewPad(true);
                            }}
                            className="rounded-lg bg-yellow-500/20 py-2 text-yellow-300 font-bold text-xs"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {show.status === "on_hold" && (
          <>
            <button
              onClick={() => updateShowStatus(show.id, "watching")}
              className="col-span-1 rounded-lg bg-sky-500 text-white text-xs sm:text-sm font-bold py-2"
            >
              ▶ Resume
            </button>

            <button
              onClick={() => updateShowStatus(show.id, "dropped")}
              className="col-span-1 rounded-lg bg-red-500 text-white text-xs sm:text-sm font-bold py-2"
            >
              ❌ Drop
            </button>
          </>
        )}

        {show.status === "dropped" && (
          <>
            <button
              onClick={() => updateShowStatus(show.id, "watching")}
              className="col-span-1 rounded-lg bg-sky-500 text-white text-xs sm:text-sm font-bold py-2"
            >
              ▶ Start
            </button>

            <button
              onClick={() => updateShowStatus(show.id, "on_hold")}
              className="col-span-1 rounded-lg bg-yellow-500 text-white text-xs sm:text-sm font-bold py-2"
            >
              ⏸ Hold
            </button>
          </>
        )}

        {show.status === "plan" && (
          <button
            onClick={() => updateShowStatus(show.id, "watching")}
            className="col-span-2 rounded-lg bg-green-500 text-white text-xs sm:text-sm font-bold py-2"
          >
            ▶ Start Watching
          </button>
        )}

        {show.status === "completed" && (
          <button
            onClick={() => updateShowStatus(show.id, "rewatch")}
            className="col-span-2 rounded-lg bg-purple-500 text-white text-xs sm:text-sm font-bold py-2"
          >
            🔄 Rewatch
          </button>
        )}
      </div>

      {/* Episode Rating Modal */}
      {showEpisodeRatingPad && selectedEpisode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6">
            <h3 className="mb-4 text-center text-lg sm:text-xl font-bold text-amber-300">
              ⭐ Rate Episode
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (!selectedEpisode) return;
                    if (num === 10) {
                      updateEpisodeRating(
                        show.id,
                        selectedEpisode.season,
                        selectedEpisode.episode,
                        10,
                      );
                      setRatingWhole(null);
                      setShowEpisodeRatingPad(false);
                      return;
                    }
                    setRatingWhole(num);
                  }}
                  className={`rounded-lg p-2 text-xs sm:text-sm font-bold ${
                    ratingWhole === num
                      ? "bg-amber-500 text-black"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {ratingWhole !== null && ratingWhole < 10 && (
              <div className="mt-4">
                <p className="mb-2 text-center text-slate-400 text-xs">
                  Select decimal
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((decimal) => (
                    <button
                      key={decimal}
                      onClick={() => {
                        if (!selectedEpisode) return;
                        const finalRating = Number(`${ratingWhole}.${decimal}`);
                        updateEpisodeRating(
                          show.id,
                          selectedEpisode.season,
                          selectedEpisode.episode,
                          finalRating,
                        );
                        setRatingWhole(null);
                        setShowEpisodeRatingPad(false);
                      }}
                      className="rounded-lg bg-slate-800 p-2 text-white hover:bg-amber-500/20 text-xs"
                    >
                      .{decimal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setRatingWhole(null);
                setShowEpisodeRatingPad(false);
              }}
              className="mt-4 w-full rounded-lg bg-red-500/20 py-2 text-red-300 font-semibold text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Episode Review Modal */}
      {showEpisodeReviewPad && selectedEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-5">
            <div className="mb-4 flex justify-between text-white">
              <h4 className="font-semibold text-xs sm:text-sm">📝 Episode Review</h4>
              <button onClick={() => setShowEpisodeReviewPad(false)}>✖</button>
            </div>

            {reviewMode === "view" ? (
              <div className="min-h-[120px] whitespace-pre-wrap rounded-lg bg-slate-800 p-3 text-slate-300 text-xs sm:text-sm">
                {selectedEpisode?.review || "No review yet"}
              </div>
            ) : (
              <textarea
                rows={6}
                value={selectedEpisode?.review || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateEpisodeReview(
                    show.id,
                    selectedEpisode.season,
                    selectedEpisode.episode,
                    "review",
                    val,
                  );
                }}
                className="w-full rounded-lg bg-slate-800 p-3 text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
              />
            )}

            <div className="mt-3 flex gap-2">
              {reviewMode === "view" ? (
                <button
                  onClick={() => setShowEpisodeReviewPad(false)}
                  className="w-full rounded-lg bg-red-500/20 py-2 text-red-300 font-semibold text-xs sm:text-sm"
                >
                  Close
                </button>
              ) : (
                <button
                  onClick={() => setShowEpisodeReviewPad(false)}
                  className="w-full rounded-lg bg-green-600 py-2 text-white font-semibold text-xs sm:text-sm"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Movie Rating Modal */}
      {showMovieRatingPad && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6">
            <h3 className="mb-4 text-center text-lg sm:text-xl font-bold text-amber-300">
              ⭐ Rate Movie
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (num === 10) {
                      updateShowRating(show.id, 10);
                      setRatingWhole(null);
                      setShowMovieRatingPad(false);
                      return;
                    }
                    setRatingWhole(num);
                  }}
                  className={`rounded-lg p-2 text-xs sm:text-sm font-bold ${
                    ratingWhole === num
                      ? "bg-amber-500 text-black"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {ratingWhole !== null && ratingWhole < 10 && (
              <div className="mt-4">
                <p className="mb-2 text-center text-slate-400 text-xs">
                  Select decimal
                </p>

                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((decimal) => (
                    <button
                      key={decimal}
                      onClick={() => {
                        const finalRating = Number(`${ratingWhole}.${decimal}`);
                        updateShowRating(show.id, finalRating);
                        setRatingWhole(null);
                        setShowMovieRatingPad(false);
                      }}
                      className="rounded-lg bg-slate-800 p-2 text-white hover:bg-amber-500/20 text-xs"
                    >
                      .{decimal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setRatingWhole(null);
                setShowMovieRatingPad(false);
              }}
              className="mt-4 w-full rounded-lg bg-red-500/20 py-2 text-red-300 font-semibold text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Movie Review Modal */}
      {show?.type === "movie" && showMovieReviewPad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-5">
            <div className="mb-4 flex justify-between text-white">
              <h4 className="font-semibold text-xs sm:text-sm">📝 Movie Review</h4>
              <button onClick={() => setShowMovieReviewPad(false)}>✖</button>
            </div>

            {reviewMode === "view" ? (
              <div className="min-h-[120px] whitespace-pre-wrap rounded-lg bg-slate-800 p-3 text-slate-300 text-xs sm:text-sm">
                {show.userReview || "No review yet"}
              </div>
            ) : (
              <textarea
                rows={6}
                value={movieReview}
                onChange={(e) => setMovieReview(e.target.value)}
                className="w-full rounded-lg bg-slate-800 p-3 text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
              />
            )}

            {reviewMode === "edit" && (
              <button
                onClick={() => {
                  updateMovieReview(show.id, movieReview);
                  setShowMovieReviewPad(false);
                }}
                className="mt-4 w-full rounded-lg bg-green-600 py-2 text-white font-semibold text-xs sm:text-sm"
              >
                Save Review
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

// Rest of component code continues... (SortableShowItem, Library component remain the same)
function SortableShowItem({ show, index, deleteShowForever }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: show.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-xl bg-slate-800 p-3"
    >
      <div className="flex items-center gap-3">
        <span className="w-3 text-sm text-slate-500">{index + 1}</span>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400"
        >
          ☰
        </div>

        <img
          src={getPosterUrl(show.poster)}
          alt={show.title}
          className="h-14 w-10 rounded-lg object-cover"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/80x120/0f172a/94a3b8?text=No+Image";
          }}
        />

        <div>
          <p className="font-medium text-sm">{show.title}</p>
          <p className="text-xs text-slate-500">{show.type}</p>
        </div>
      </div>

      <button
        onClick={() => deleteShowForever(show.id)}
        className="rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
      >
         🗑
      </button>
    </div>
  );
}

const Library = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [selectedShowId, setSelectedShowId] = useState(null);
  const [savedReviews, setSavedReviews] = useState(loadSavedReviews);
  const [tabOrders, setTabOrders] = useState(loadTabOrders);
  const [allShows, setAllShows] = useState([]);
  const [showArrangeModal, setShowArrangeModal] = useState(false);
  const [arrangedShows, setArrangedShows] = useState([]);
  const [showRatingPad, setShowRatingPad] = useState(false);
  const [reviewMode, setReviewMode] = useState("edit");
  const [movieReview, setMovieReview] = useState("");
  const [showMovieRatingPad, setShowMovieRatingPad] = useState(false);
  const [showMovieReviewPad, setShowMovieReviewPad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingText, setLoadingText] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [highlightShow, setHighlightShow] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isGuest = !currentUser;
  const messages = [
    "📚 Loading your WatchVerse...",
    "🍿 Fetching your library...",
    "🎬 Almost your library is here...",
    "🚀 Let's Goo...",
  ];

  const filteredShows = useMemo(() => {
    const shows = filterShows(allShows, activeTab);
    const savedOrder = tabOrders[activeTab];
    if (!savedOrder?.length) return shows;
    const ordered = [];
    savedOrder.forEach((id) => {
      const found = shows.find(show => show.id === id);
      if (found) ordered.push(found);
    });
    const remaining = shows.filter(
      show => !savedOrder.includes(show.id)
    );
    return [...ordered, ...remaining];
  }, [allShows, activeTab, tabOrders]);

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Jab tak mouse 8px move nahi hota, drag start nahi hoga
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Mobile par item par 250ms tak ungli hold karni padegi tab drag shuru hoga (taki scroll kharab na ho)
      tolerance: 5, // 5px tak hilne par bhi cancel nahi hoga
    },
  })
);

  useEffect(() => {
    const filtered = filterShows(allShows, activeTab);
    if (
      filtered.length > 0 &&
      !filtered.some((show) => show.id === selectedShowId)
    ) {
      setSelectedShowId(filtered[0].id);
    }
    if (filtered.length === 0) {
      setSelectedShowId(null);
    }
  }, [allShows, activeTab]);

  useEffect(() => {
    if (selectedShowId) return;
    if (filteredShows.length > 0) {
      setSelectedShowId(filteredShows[0].id);
    }
  }, [filteredShows, selectedShowId]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const show = searchParams.get("show");
    if (!tab || allShows.length === 0) return;
    setActiveTab(tab);
    const id = Number(show);
    if (!show || Number.isNaN(id)) return;
    setTimeout(() => {
      setSelectedShowId(id);
      setHighlightShow(id);
      setTimeout(() => {
        setHighlightShow(null);
      }, 2000);
    }, 100);
  }, [allShows, searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedShowId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`show-${selectedShowId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedShowId]);

  useEffect(() => {
    if (!loadingLibrary) return;
    const interval = setInterval(() => {
      setLoadingText((prev) =>
        prev === messages.length - 1 ? prev : prev + 1,
      );
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingLibrary]);

  useEffect(() => {
    if (showArrangeModal) {
      setArrangedShows(filteredShows);
    }
  }, [showArrangeModal, activeTab]);

  useEffect(() => {
    if (!currentUser) {
      setLoadingLibrary(false);
      return;
    }
    const loadLibrary = async () => {
      try {
        const stored = await getLibrary(currentUser.uid);
        const upgraded = stored.map((show) => ({
          ...show,
          id: show.tmdbId,
          currentSeason: show.currentSeason || 1,
          currentEpisode: show.currentEpisode || 1,
          watchHistory: show.watchHistory || [],
          episodeRatings: show.episodeRatings || {},
          episodeReviews: show.episodeReviews || {},
          seasonHistory: show.seasonHistory || {},
        }));
        setAllShows(upgraded);
      } finally {
        setLoadingLibrary(false);
      }
    };
    loadLibrary();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("watchverse-tab-orders", JSON.stringify(tabOrders));
  }, [tabOrders]);

  const tabs = useMemo(
    () => [
      {
        id: "favorites",
        label: "Favorites",
        count: allShows.filter((show) => show.isFavorite).length,
      },
      {
        id: "watching",
        label: "Watching",
        count: allShows.filter((show) => show.status === "watching").length,
      },
      {
        id: "completed",
        label: "Completed",
        count: allShows.filter((show) => show.status === "completed").length,
      },
      {
        id: "on_hold",
        label: "On Hold",
        count: allShows.filter((show) => show.status === "on_hold").length,
      },
      {
        id: "dropped",
        label: "Dropped",
        count: allShows.filter((show) => show.status === "dropped").length,
      },
      {
        id: "plan",
        label: "Plan To Watch",
        count: allShows.filter((show) => show.status === "plan").length,
      },
    ],
    [allShows],
  );

  const updateShowRating = async (showId, rating) => {
    const updated = allShows.map((item) =>
      item.id === showId
        ? {
            ...item,
            userRating: rating,
          }
        : item,
    );
    setAllShows(updated);
    const changed = updated.find((x) => x.id === showId);
    if (changed) {
      await addToLibrary(changed);
    }
  };

  const updateMovieReview = async (showId, review) => {
    const updated = allShows.map((item) =>
      item.id === showId
        ? {
            ...item,
            userReview: review,
          }
        : item,
    );
    setAllShows(updated);
    const changed = updated.find((x) => x.id === showId);
    if (changed) {
      await addToLibrary(changed);
    }
  };

  const selectedShow = allShows.find((show) => show.id === selectedShowId);
  const selectedReview = selectedShow
    ? savedReviews[selectedShow.id] || ""
    : "";

  const watchingCount = allShows.filter(
    (show) => show.status === "watching",
  ).length;

  const favoriteCount = allShows.filter((show) => show.isFavorite).length;
  const completedCount = allShows.filter(
    (show) => show.status === "completed",
  ).length;
  const planCount = allShows.filter((show) => show.status === "plan").length;

  const handleTabChange = (tabId) => {
    const firstShow = filterShows(allShows, tabId)[0];
    setActiveTab(tabId);
    setSelectedShowId(firstShow?.id);
  };

  const handleSaveReview = (showId, review) => {
    setSavedReviews((currentReviews) => ({
      ...currentReviews,
      [showId]: review.trim(),
    }));
  };

const updateEpisodeProgress = async (showId, actionOrParams = {}) => {
  setAllShows((prev) => {
    const updated = prev.map((s) => {
      if (s.id !== showId && s.tmdbId !== showId) return s;
      const show = { ...s };
      const runtimeSeconds = normalizeRuntime(show);
      const nowIso = new Date().toISOString();

      show.watchHistory = Array.isArray(show.watchHistory) ? [...show.watchHistory] : [];

      let currentSeason = show.currentSeason || 1;
      let currentEpisode = show.currentEpisode || 1;

      // Handle string actions from the buttons ("increase", "decrease", "start")
      if (typeof actionOrParams === "string") {
        const currentSeasonData = show.seasons?.find((s) => s.seasonNumber === currentSeason);
        const maxEpisodesInSeason = currentSeasonData?.episodeCount || 1;

        if (actionOrParams === "increase") {
          if (currentEpisode < maxEpisodesInSeason) {
            currentEpisode += 1;
          }
        } else if (actionOrParams === "decrease") {
          if (currentEpisode > 1) {
            currentEpisode -= 1;
          } else if (currentSeason > 1) {
            currentSeason -= 1;
            const prevSeasonData = show.seasons?.find((s) => s.seasonNumber === currentSeason);
            currentEpisode = prevSeasonData?.episodeCount || 1;
          }
        }
        
        // Reset timing variables on episode change
        show.currentTime = 0;
        show.waitingForSeasonStart = false;
      } else {
        // Handle object params if called from ranges/inputs ({ season, episode, newTime })
        const { season = null, episode = null, newTime = 0 } = actionOrParams;
        currentSeason = season ?? currentSeason;
        currentEpisode = episode ?? currentEpisode;
        const sec = Number(newTime || 0);
        show.currentTime = Math.max(0, Math.min(sec, runtimeSeconds || sec));
      }

      // Update structural values
      show.currentSeason = currentSeason;
      show.currentEpisode = currentEpisode;

      // Sync watch history entry
      const idx = show.watchHistory.findIndex((ep) => ep.season === currentSeason && ep.episode === currentEpisode);

      if (idx === -1) {
        show.watchHistory.push({
          season: currentSeason,
          episode: currentEpisode,
          startedAt: show.startedAt || nowIso,
          watchedAt: nowIso,
          watchTime: show.currentTime,
          rating: null,
          review: "",
        });
      } else {
        const entry = { ...show.watchHistory[idx] };
        if (show.currentTime > 0) entry.watchedAt = nowIso;
        show.watchHistory[idx] = entry;
      }

      if (show.currentTime > 0 || typeof actionOrParams === "string") {
        show.lastWatchedAt = nowIso;
      }

      return show;
    });

    // Background persistence
    setTimeout(() => {
      updated.forEach(async (s) => {
        if (s.id === showId || s.tmdbId === showId) {
          try {
            await addToLibrary(s);
          } catch (e) {
            console.warn("Failed to persist progress", e);
          }
        }
      });
    }, 0);

    return updated;
  });
};

    const finishSeason = (showId) => {
    setAllShows((prev) => {
      const updated = prev.map((show) => {
        if (show.id !== showId && show.tmdbId !== showId) return show;

        const finishedSeason = show.currentSeason;
        const now = new Date().toISOString();

        // Ensure we have a seasonHistory object
        const seasonHistory = {
          ...(show.seasonHistory || {}),
          // mark the season that was just finished
          [finishedSeason]: {
            ...(show.seasonHistory?.[finishedSeason] || {}),
            startedAt:
              show.seasonHistory?.[finishedSeason]?.startedAt ||
              show.startedAt ||
              null,
            completedAt: now,
          },
        };

        // prepare next season entry (create key with null startedAt so UI can update it later)
        const nextSeason = (show.currentSeason || 1) + 1;
        if (!seasonHistory[nextSeason]) {
          seasonHistory[nextSeason] = {
            ...(seasonHistory[nextSeason] || {}),
            startedAt: null,
            completedAt: null,
          };
        }

              return {
          ...show,
          waitingForSeasonStart: true,
          currentEpisodeStarted: false,
          currentSeason: nextSeason,
          currentEpisode: 1,
          currentTime: 0,
          lastWatchedAt: now,
            seasonHistory,
          };
      });

      const changed = updated.find(
    (x) => x.id === showId || x.tmdbId === showId
  );

      if (changed) {
        addToLibrary(changed).catch(console.error);
      }

      return updated;
    });
  };


  const updateTime = (showId, seconds) => {
    setAllShows((prev) => {
      const updated = prev.map((show) => {
        if (show.id !== showId) return show;

        let currentTime = (show.currentTime || 0) + seconds;

        if (currentTime < 0) currentTime = 0;

        if (show.type === "movie") {
          const duration = getRuntimeSeconds(show);

          if (currentTime >= duration) {
            currentTime = duration;

            return {
              ...show,
              currentTime,
              startedAt: show.startedAt || new Date().toISOString(),
              lastWatchedAt: new Date().toISOString(),
            };
          }

          return {
            ...show,
            currentTime,
            startedAt:
              show.startedAt ||
              (currentTime > 0 ? new Date().toISOString() : null),
            lastWatchedAt: new Date().toISOString(),
          };
        }

        const episodeRuntime = getRuntimeSeconds(show);

        if (show.type === "tv") {
          currentTime = Math.min(currentTime, episodeRuntime);

          return {
            ...show,
            currentTime,
            startedAt:
              show.startedAt ||
              (currentTime > 0 ? new Date().toISOString() : null),
            lastWatchedAt: new Date().toISOString(),
          };
        }

        return {
          ...show,
          currentTime,
          startedAt:
            show.startedAt ||
            (currentTime > 0 ? new Date().toISOString() : null),
          lastWatchedAt: new Date().toISOString(),
        };
      });

      const changed = updated.find((x) => x.id === showId);
      if (changed) {
        addToLibrary(changed);
      }
      return updated;
    });
  };

  const updateShowStatus = async (showId, newStatus) => {
    const updatedLibrary = allShows.map((show) =>
      show.id === showId
        ? {
            ...show,
            status: newStatus === "rewatch" ? "watching" : newStatus,
            rewatchCount:
              newStatus === "rewatch"
                ? (show.rewatchCount || 0) + 1
                : show.rewatchCount || 0,
            currentSeason: newStatus === "rewatch" ? 1 : show.currentSeason,
            currentEpisode: newStatus === "rewatch" ? 1 : show.currentEpisode,
            startedAt:
              newStatus === "rewatch"
                ? new Date().toISOString()
                : newStatus === "watching" && !show.startedAt
                  ? new Date().toISOString()
                  : show.startedAt,
            pendingCompletion:
              newStatus === "rewatch" ? false : show.pendingCompletion,
            currentTime: newStatus === "rewatch" ? 0 : show.currentTime,
            isFavorite: show.isFavorite,
            watchHistory:
              newStatus === "completed"
                ? (() => {
                    const exists = (show.watchHistory || []).some(
                      (ep) =>
                        ep.season === show.currentSeason &&
                        ep.episode === show.currentEpisode,
                    );

                    if (exists) {
                      return show.watchHistory;
                    }

                    return [
                      ...(show.watchHistory || []),
                      {
                        season: show.currentSeason,
                        episode: show.currentEpisode,
                        startedAt: new Date().toISOString(),
                        watchedAt: new Date().toISOString(),
                        watchTime: show.currentTime || 0,
                        rating: null,
                        review: "",
                      },
                    ];
                  })()
                : show.watchHistory,
            completedAt:
              newStatus === "completed" ? new Date().toISOString() : null,
            lastWatchedAt: new Date().toISOString(),
          }
        : show,
    );

    setAllShows(updatedLibrary);

    const changed = updatedLibrary.find((x) => x.id === showId);

    if (changed) {
      await addToLibrary(changed);
    }

    // Use the UI ordering (filteredShows + tabOrders) to find currentIndex
    // In Library.jsx inside updateShowStatus function:
// Replace the selection logic at the end of updateShowStatus with this:

const oldFiltered = filteredShows;
const currentIndex = oldFiltered.findIndex((item) => item.id === showId);

// Fresh filtered list nikalo
const showsAfter = filterShows(updatedLibrary, activeTab);
const savedOrder = tabOrders[activeTab];
let newFiltered;
if (savedOrder?.length) {
  const ordered = [];
  savedOrder.forEach((id) => {
    const found = showsAfter.find((s) => s.id === id);
    if (found) ordered.push(found);
  });
  const remaining = showsAfter.filter((s) => !savedOrder.includes(s.id));
  newFiltered = [...ordered, ...remaining];
} else {
  newFiltered = showsAfter;
}

let nextSelected = null;

if (newFiltered.length > 0) {
  // Agar hum regular tabs (watching, dropped) mein hain aur show wahan se hutt chuka hai
  if (!newFiltered.some(s => s.id === showId)) {
    if (newFiltered[currentIndex]) {
      nextSelected = newFiltered[currentIndex];
    } else {
      nextSelected = newFiltered[newFiltered.length - 1];
    }
  } else {
    // Agar show abhi bhi usi tab mein maujood hai (Jaise Favorites tab), toh usse agla wala select karo
    if (newFiltered[currentIndex + 1]) {
      nextSelected = newFiltered[currentIndex + 1];
    } else if (newFiltered[currentIndex - 1]) {
      nextSelected = newFiltered[currentIndex - 1];
    } else {
      nextSelected = newFiltered[0];
    }
  }
}

const nextId = nextSelected?.id ?? null;
setSelectedShowId(nextId);

if (nextId) {
  navigate(`/library?tab=${activeTab}&show=${nextId}`, { replace: true });
} else {
  navigate(`/library?tab=${activeTab}`, { replace: true });
}
  };

  const updateEpisodeRating = (showId, season, episode, rating) => {
    setAllShows((prev) => {
      const updated = prev.map((show) => {
        if (show.id !== showId) return show;

        return {
          ...show,
          watchHistory: (show.watchHistory || []).map((ep) =>
            ep.season === season && ep.episode === episode
              ? {
                  ...ep,
                  rating,
                }
              : ep,
          ),
        };
      });

      const changed = updated.find((x) => x.id === showId);

      if (changed) {
        addToLibrary(changed);
      }

      return updated;
    });
  };

  const updateSentiment = (showId, sentiment) => {
    setAllShows((prev) => {
      const updated = prev.map((show) =>
        show.id === showId ? { ...show, sentiment } : show,
      );
      const changed = updated.find((x) => x.id === showId);

      if (changed) {
        addToLibrary(changed);
      }
      return updated;
    });
  };

  const updateEpisodeReview = (showId, season, episode, field, value) => {
    setAllShows((prev) => {
      const updated = prev.map((show) => {
        if (show.id !== showId) return show;

        return {
          ...show,
          watchHistory: (show.watchHistory || []).map((item) => {
            if (item.season === season && item.episode === episode) {
              return {
                ...item,
                [field]: value,
              };
            }

            return item;
          }),
        };
      });

      const changed = updated.find((x) => x.id === showId);

      if (changed) {
        addToLibrary(changed);
      }

      return updated;
    });
  };

  const jumpToEpisode = (showId, season, episode) => {
    setAllShows((prev) => {
      const updated = prev.map((show) => {
        if (show.id !== showId) return show;

        return {
          ...show,
          currentSeason: season,
          currentEpisode: episode,
          currentTime: 0,
        };
      });

      const changed = updated.find((x) => x.id === showId);

      if (changed) {
        addToLibrary(changed);
      }

      return updated;
    });
  };

  const removeFavorite = (showId) => {
    setAllShows((prev) => {
      const updated = prev.map((show) =>
        show.id === showId
          ? {
              ...show,
              isFavorite: false,
            }
          : show,
      );

      const changed = updated.find((x) => x.id === showId);
      if (changed) {
        addToLibrary(changed);
      }
      return updated;
    });
  };

  const deleteShowForever = (showId) => {
    const confirmed = window.confirm(
      "⚠️ Are you sure?\n\nThis will permanently delete:\n• Progress\n• Reviews\n• Watch history\n• Episode ratings\n• Everything related to this show",
    );

    if (!confirmed) return;

    const updated = allShows.filter((show) => show.id !== showId);

    setAllShows(updated);
    for (const movie of updated) {
      addToLibrary(movie);
    }

    setArrangedShows((prev) => prev.filter((show) => show.id !== showId));

    if (selectedShowId === showId) {
      setSelectedShowId(updated[0]?.id || null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setArrangedShows((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  


  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-5 text-cyan-300">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isGuest && loadingLibrary) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-5 text-cyan-300">{messages[loadingText]}</p>
        </div>
      </div>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
  <p className="text-[11px] sm:text-sm font-semibold uppercase tracking-[0.18em] text-sky-400">
    Personal library
  </p>
  <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">
    Your WatchVerse history
  </h1>
  {/* Choti screen par text short kar diya taaki clutter na ho */}
  <p className="mt-2 text-xs text-slate-400 block sm:hidden">
    Track titles, episodes, watch history, and personal notes.
  </p>
  <p className="mt-3 max-w-3xl text-slate-400 hidden sm:block">
    Track titles by real watching status, then open any show to see
    overview, episodes, watch history, and notes from your side.
  </p>
</div>

{/* Padding px-2 aur tracking classes adjust kiye hain taaki mobile par vertical text wrap na ho */}
<div className="grid grid-cols-3 gap-2 sm:gap-3 text-center w-full">
  <div className="min-w-0 rounded-2xl bg-slate-800 py-3 px-2 sm:p-4">
    <p className="text-xl sm:text-2xl font-black text-white">{watchingCount}</p>
    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wide truncate">Watching</p>
  </div>
  <div className="min-w-0 rounded-2xl bg-slate-800 py-3 px-2 sm:p-4">
    <p className="text-xl sm:text-2xl font-black text-white">{completedCount}</p>
    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wide truncate">Completed</p>
  </div>
  <div className="min-w-0 rounded-2xl bg-slate-800 py-3 px-1 sm:p-4">
    <p className="text-xl sm:text-2xl font-black text-white">{planCount}</p>
    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wide lowercase first-letter:uppercase whitespace-nowrap sm:whitespace-normal">
      Plan to watch
    </p>
  </div>
</div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Library sections</h2>
              <p className="mt-1 text-slate-400">
                Watching, Completed, On Hold, Dropped, and Plan To Watch.
              </p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-min">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/50 scale-105"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {tab.label} <span className="text-xs ml-1">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowArrangeModal(true)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700 whitespace-nowrap"
            >
              📋 Arrange
            </button>
          </div>

          {isGuest ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/85 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 text-center sm:text-left shadow-xl w-full max-w-full my-6 animate-fade-slide-up">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-40 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 w-full px-2">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      Start your WatchVerse journey
                    </h3>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    Create an account or login to sync your library, ratings,
                    reviews, streaks, and statistics across all your devices.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    🔑 Join WatchVerse
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px] items-start">
              <div className="w-full">
                <ShowGrid
                  highlightShow={highlightShow}
                  shows={filteredShows}
                  view={activeTab}
                  selectedId={selectedShow?.id}
                  onSelect={(show) => {
                    setSelectedShowId(show.id);
                    navigate(
                      `/library?tab=${activeTab}&show=${show.id}`,
                      { replace: true }
                    );
                  }}
                  renderDetails={
                    selectedShow && (
                      <ShowDetails
                        key={selectedShow.id}
                        show={selectedShow}
                        activeTab={activeTab}
                        updateShowStatus={updateShowStatus}
                        updateEpisodeProgress={updateEpisodeProgress}
                        removeFavorite={removeFavorite}
                        updateSentiment={updateSentiment}
                        updateTime={updateTime}
                        updateEpisodeReview={updateEpisodeReview}
                        updateEpisodeRating={updateEpisodeRating}
                        updateShowRating={updateShowRating}
                        updateMovieReview={updateMovieReview}
                        showRatingPad={showRatingPad}
                        showMovieRatingPad={showMovieRatingPad}
                        setShowRatingPad={setShowRatingPad}
                        setShowMovieRatingPad={setShowMovieRatingPad}
                        showMovieReviewPad={showMovieReviewPad}
                        movieReview={movieReview}
                        setMovieReview={setMovieReview}
                        reviewMode={reviewMode}
                        setReviewMode={setReviewMode}
                        setShowMovieReviewPad={setShowMovieReviewPad}
                        jumpToEpisode={jumpToEpisode}
                        finishSeason={finishSeason}
                      />
                    )
                  }
                />
              </div>

              <div className="hidden xl:block xl:sticky xl:top-4 self-start">
                {selectedShow && (
                  <ShowDetails
                    key={selectedShow.id}
                    show={selectedShow}
                    activeTab={activeTab}
                    updateShowStatus={updateShowStatus}
                    updateEpisodeProgress={updateEpisodeProgress}
                    removeFavorite={removeFavorite}
                    updateSentiment={updateSentiment}
                    updateTime={updateTime}
                    updateEpisodeReview={updateEpisodeReview}
                    updateEpisodeRating={updateEpisodeRating}
                    updateShowRating={updateShowRating}
                    updateMovieReview={updateMovieReview}
                    showRatingPad={showRatingPad}
                    showMovieRatingPad={showMovieRatingPad}
                    setShowRatingPad={setShowRatingPad}
                    setShowMovieRatingPad={setShowMovieRatingPad}
                    showMovieReviewPad={showMovieReviewPad}
                    movieReview={movieReview}
                    setMovieReview={setMovieReview}
                    reviewMode={reviewMode}
                    setReviewMode={setReviewMode}
                    setShowMovieReviewPad={setShowMovieReviewPad}
                    jumpToEpisode={jumpToEpisode}
                    finishSeason={finishSeason}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {showArrangeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                📋 Arrange {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>

              <button
                onClick={() => {
                  setTabOrders((prev) => ({
                    ...prev,
                    [activeTab]: arrangedShows.map((show) => show.id),
                  }));

                  setShowArrangeModal(false);
                }}
                className="rounded-xl bg-green-600 px-4 py-2"
              >
                Done
              </button>
            </div>

            <DndContext
              sensors={sensors} // <- Yeh sensors prop pass karna zaroori hai boss
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={arrangedShows.map((show) => show.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {arrangedShows.map((show, index) => (
                    <SortableShowItem
                      key={show.id}
                      show={show}
                      index={index}
                      deleteShowForever={deleteShowForever}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Library;