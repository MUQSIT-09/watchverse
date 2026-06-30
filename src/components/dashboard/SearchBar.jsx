import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthRequiredModal from "../common/AuthRequiredModal";
import { Heart, ListPlus, Play, Search } from "lucide-react";
import { searchMulti, getShowDetails } from "../../services/tmdb";
import { addToLibrary, getLibrary } from "../../utils/libraryStorage";

const SearchBar = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  const handleSearch = async (value) => {
    setQuery(value);
    setMessage("");

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      const data = await searchMulti(value);
      setResults(
        (data.results || []).filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        )
      );
    } catch (error) {
      console.error("Search Error:", error);
      setMessage("Search failed. Check your connection.");
    }
  };

  const handleAction = async (item, action) => {
    setMessage("");
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const library = await getLibrary(user.uid);
      const existing = (library || []).find((x) => x.tmdbId === item.id);

      const title = item.title || item.name || "Untitled";

      const actionLabels = {
        favorite: "Added to Favorites",
        plan: "Added to Plan To Watch",
        watching: "Started Watching",
      };

      // load TMDB details
      let details;
      try {
        details = await getShowDetails(item.id, item.media_type);
      } catch (err) {
        console.error("TMDB Details Error:", err);
        setMessage("Failed to fetch details. Try again.");
        return;
      }

      if (!details) {
        setMessage("No details found for this title.");
        return;
      }

      // runtime
      let runtime = 0;
      if (item.media_type === "movie") {
        runtime = details?.runtime || 0;
      } else {
        runtime =
          details?.episode_run_time?.[0] ||
          details?.last_episode_to_air?.runtime ||
          0;
      }

      // Prevent invalid transitions
      if (
        action === "plan" &&
        existing &&
        (existing.status === "watching" || existing.status === "completed")
      ) {
        setMessage(
          existing.status === "watching"
            ? `⚠️ ${title} is already in Watching.`
            : `⚠️ ${title} is already Completed.`
        );
        return;
      }
      if (action === "favorite" && existing?.isFavorite) {
        setMessage(`⭐ ${title} is already in Favorites.`);
        return;
      }
      if (action === "watching" && existing && existing.status === "completed") {
        setMessage(
          `⚠️ You have already completed ${title}. Use the Rewatch option from your Library.`
        );
        return;
      }

      // Build/augment watchHistory and lastWatchedAt
      const nowIso = new Date().toISOString();
      const baseWatchHistory = existing?.watchHistory || [];
      let watchHistory = [...baseWatchHistory];

      if (action === "watching") {
        const season = existing?.currentSeason || 1;
        const episode = existing?.currentEpisode || 1;
        const exists = watchHistory.find((ep) => ep.season === season && ep.episode === episode);
        if (!exists) {
          watchHistory.push({
            season,
            episode,
            startedAt: nowIso,
            watchedAt: nowIso,
            watchTime: 0,
            rating: null,
            review: "",
          });
        } else {
          watchHistory = watchHistory.map((ep) => (ep === exists ? { ...exists, watchedAt: nowIso } : ep));
        }
      }

      if (action === "completed") {
        watchHistory.push({
          season: existing?.currentSeason || 1,
          episode: existing?.currentEpisode || 1,
          startedAt: existing?.startedAt || nowIso,
          watchedAt: nowIso,
          watchTime: existing?.currentTime || 0,
          rating: null,
          review: "",
        });
      }

      const showData = {
        ...existing,
        id: item.id,
        tmdbId: item.id,
        title,
        poster: item.poster_path,
        type: item.media_type,
        firebaseUid: user.uid,
        status:
          action === "favorite"
            ? existing?.status || "plan"
            : existing?.status === "plan" && action === "watching"
            ? "watching"
            : existing?.status === "dropped" && action === "watching"
            ? "watching"
            : existing?.status === "on_hold" && action === "watching"
            ? "watching"
            : action,
        isFavorite: action === "favorite" ? true : existing?.isFavorite || false,
        tmdbRating: item.vote_average,
        imdbId: details.imdb_id,
        imdbRating: details.imdb_rating,
        totalSeasons: item.media_type === "tv" ? details.number_of_seasons || 1 : 1,
        totalEpisodes: item.media_type === "tv" ? details.number_of_episodes || 1 : 1,
        runtime: runtime * 60,
        duration: runtime,
        genres: details.genres?.map((g) => g.name) || [],
        year: (item.release_date && item.release_date.split("-")[0]) || (item.first_air_date && item.first_air_date.split("-")[0]) || "",
        overview: item.overview,
        cast: details.credits?.cast?.slice(0, 5) || [],
        currentTime: existing?.currentTime || 0,
        currentSeason: existing?.currentSeason || 1,
        currentEpisode: existing?.currentEpisode || 1,
        watchHistory,
        episodeRatings: existing?.episodeRatings || {},
        episodeReviews: existing?.episodeReviews || {},
        seasonHistory: existing?.seasonHistory || {},
        seasons:
          existing?.seasons ||
          (details.seasons
            ?.filter((s) => s.season_number !== 0)
            .map((s) => ({ seasonNumber: s.season_number, episodeCount: s.episode_count })) || []),
        lastWatchedAt: action === "watching" || action === "completed" ? nowIso : existing?.lastWatchedAt || existing?.lastWatchedAt,
      };

      console.log("ADDING:", { id: showData.id, tmdbId: showData.tmdbId });
      console.log("ACTION =", action);
      console.log("SHOW DATA =", showData);

      try {
        const resp = await addToLibrary(showData);
        if (resp && resp.queued) {
          setMessage(`Saved offline — will sync when online: ${title}`);
        } else {
          setMessage(`${actionLabels[action]}: ${title}`);
        }
      } catch (err) {
        console.error("Library Save Error:", err);
        setMessage(`Failed to save ${title}. Will retry when online.`);
      }
    } catch (err) {
      console.error("handleAction error:", err);
      setMessage("An error occurred. Try again.");
    }
  };

  return (
    <>
      {results.length > 0 && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setResults([])} />}

      <div className="relative mb-8 z-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 transition-all focus-within:border-slate-700">
          <Search size={20} className="text-slate-500" />

          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search movies, series..."
            className="w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {message && <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}

        {results.length > 0 && (
          <div className="absolute z-50 mt-2 max-h-[34rem] w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 scrollbar-none shadow-2xl shadow-black/80">
            {results.slice(0, 8).map((item) => (
              <div
                key={`${item.media_type}-${item.id}`}
                className="grid gap-3 border-b border-slate-800 p-3 last:border-b-0 grid-cols-[48px_1fr] sm:grid-cols-[48px_1fr_auto] items-center"
              >
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "https://placehold.co/200x300/0f172a/94a3b8?text=No+Poster"}
                  alt={item.title || item.name}
                  className="h-16 w-12 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/200x300/0f172a/94a3b8?text=No+Poster";
                  }}
                />

                <div className="min-w-0">
                  <h3 className="truncate text-sm sm:text-base font-semibold text-white">{item.title || item.name}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 capitalize">
                    Rating {item.vote_average ? item.vote_average.toFixed(1) : "NA"} • {item.media_type}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 grid grid-cols-3 gap-2 w-full sm:w-40 mt-1 sm:mt-0">
                  <button type="button" onClick={() => handleAction(item, "favorite")} className="rounded-lg bg-slate-800/80 p-2 text-slate-300 transition hover:bg-rose-500 hover:text-white flex items-center justify-center" title="Favorite">
                    <Heart size={16} className="mx-auto" />
                  </button>

                  <button type="button" onClick={() => handleAction(item, "plan")} className="rounded-lg bg-slate-800/80 p-2 text-slate-300 transition hover:bg-sky-500 hover:text-white flex items-center justify-center" title="Plan To Watch">
                    <ListPlus size={16} className="mx-auto" />
                  </button>

                  <button type="button" onClick={() => handleAction(item, "watching")} className="rounded-lg bg-slate-800/80 p-2 text-slate-300 transition hover:bg-emerald-500 hover:text-white flex items-center justify-center" title="Start Watching">
                    <Play size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </>
  );
};

export default SearchBar;