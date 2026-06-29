import {
  useEffect,
  useMemo,
  useState
} from "react";

import { useAuth }
from "../context/AuthContext";

import AuthRequiredModal
from "../components/common/AuthRequiredModal";

import MainLayout from "../components/layout/MainLayout";

import ShowCard from "../components/library/ShowCard";

import {
  getLibrary
} from "../utils/libraryStorage";

import {
  getShowDetails
} from "../services/tmdb";

const Discover = () => {
  const { user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [library, setLibrary] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(false);

  // Single effect to load library and genres
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLibrary([]);
        setGenreMap({});
        return;
      }

      setLoading(true);

      try {
        // Get library from backend
        const saved = await getLibrary(user.uid);
        const safeLibrary = Array.isArray(saved) ? saved : [];
        
        setLibrary(safeLibrary);

        // Load genres for all shows
        const map = {};

        for (const show of safeLibrary) {
          const details = await getShowDetails(
            show.tmdbId,
            show.type === "tv" || show.type === "TV" ? "tv" : "movie"
          );

          if (details?.genres) {
            map[show.tmdbId] = details.genres.map(g => g.name);
          }
        }

        setGenreMap(map);
      } catch (error) {
        console.error("Error loading library:", error);
        setLibrary([]);
        setGenreMap({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Generate categories from genres
  const categories = useMemo(() => {
    const list = new Set();

    list.add("All");
    list.add("Movies");
    list.add("TV Shows");

    Object.values(genreMap).forEach((genres) => {
      genres.forEach((g) => list.add(g));
    });

    return [...list];
  }, [genreMap]);

  // Filter shows based on category
  const filteredShows = useMemo(() => {
    return library.filter((show) => {
      if (activeCategory === "All") return true;

      if (activeCategory === "Movies") {
        return show.type === "movie" || show.type === "Movie";
      }

      if (activeCategory === "TV Shows") {
        return show.type === "tv" || show.type === "TV";
      }

      return (genreMap[show.tmdbId] || []).includes(activeCategory);
    });
  }, [library, activeCategory, genreMap]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
<section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
  <p className="text-sky-400 font-semibold uppercase text-[11px] sm:text-sm tracking-wider">
    Discover
  </p>
  <h1 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-white">
    Explore Library
  </h1>
  {/* Mobile par short text aur desktop par full details render hongi */}
  <p className="text-slate-400 mt-2 text-xs block sm:hidden">
    Your collection filtered by categories.
  </p>
  <p className="text-slate-400 mt-3 text-sm hidden sm:block">
    Your saved shows categorized by Genres.
  </p>
</section>

        {/* Not authenticated */}
        {!user ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-3xl font-black text-white">
              Unlock Discover
            </h2>

            <p className="mt-6 text-slate-400">
              Create an account to unlock:
            </p>

            <div className="mt-6 space-y-3 text-left max-w-md mx-auto">
              <p className="text-slate-200">
                ✓ Personalized recommendations
              </p>
              <p className="text-slate-200">
                ✓ Genre insights
              </p>
              <p className="text-slate-200">
                ✓ Smart discovery
              </p>
              <p className="text-slate-200">
                ✓ Watch history analysis
              </p>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-8 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white hover:bg-sky-400 transition"
            >
              Continue with Google
            </button>
          </section>
        ) : loading ? (
          // Loading state
          <section className="rounded-3xl bg-slate-900 p-10 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-sky-500 border-t-transparent"></div>
              <span className="text-slate-400">Loading your library...</span>
            </div>
          </section>
        ) : library.length === 0 ? (
          // Empty library state
          <section className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-center">
            <div className="inline-block mb-4 text-5xl">📚</div>
            <h2 className="text-2xl font-bold text-white">
              Start Watching Shows
            </h2>
            <p className="text-slate-400 mt-2">
              Add shows to your library first to see them here.
            </p>
          </section>
        ) : (
          // Shows and categories
          <>
            {/* Category Tabs - Horizontal Scrollable */}
            <section className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-min">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      activeCategory === cat
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/50 scale-105"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* Shows Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredShows.length === 0 ? (
                <div className="col-span-full bg-slate-900 rounded-3xl p-10 text-center text-slate-400">
                  <p className="text-lg">No shows in this category</p>
                </div>
              ) : (
                filteredShows.map((show) => (
                  <ShowCard
                    key={show.tmdbId || show._id}
                    show={show}
                    isSelected={selectedShow?.id === show.tmdbId}
                    onSelect={setSelectedShow}
                  />
                ))
              )}
            </section>
          </>
        )}
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </MainLayout>
  );
};

export default Discover;
