import { Heart } from "lucide-react";
import { getPosterUrl } from "../../utils/getPosterUrl";

const getStatusBadge = (status) => {
  switch (status) {
    case "watching":
      return {
        label: "🔥 Watching",
        className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      };
    case "completed":
      return {
        label: "🎯 Completed",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "on_hold":
      return {
        label: "⏸ On Hold",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "dropped":
      return {
        label: "❌ Dropped",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "plan":
      return {
        label: "📋 Planned",
        className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
    default:
      return null;
  }
};

const getSentimentBadge = (sentiment) => {
  switch (sentiment) {
    case "masterpiece":
      return {
        label: "👑 Masterpiece",
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      };
    case "underrated":
      return {
        label: "💎 Underrated",
        className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      };
    case "overrated":
      return {
        label: "📉 Overrated",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "average":
      return {
        label: "😐 Average",
        className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
    case "guilty_pleasure":
      return {
        label: "🍿 Guilty Pleasure",
        className: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      };
    case "one_time_watch":
      return {
        label: "🎬 One Time",
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    default:
      return null;
  }
};


const ShowCard = ({
  show,
  isSelected,
  onSelect,
  highlight,
}) => {
  const statusBadge = getStatusBadge(show.status);
  const sentimentBadge = getSentimentBadge(show.sentiment);

  const episodeRatings =
    show.watchHistory?.filter((ep) => ep.rating)?.map((ep) => ep.rating) || [];

  const avgEpisodeRating =
    episodeRatings.length > 0
      ? (
          episodeRatings.reduce((a, b) => a + b, 0) / episodeRatings.length
        ).toFixed(1)
      : null;

  const userRating = show.type === "movie" ? show.userRating : avgEpisodeRating;

  return (
    <article
      id={`show-${show.id || show.tmdbId || show._id}`}
      onClick={() => onSelect?.(show)}
      className={`group cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111827] to-[#0f172a] transition-all duration-500 hover:-translate-y-1 flex flex-row sm:flex-col

${
  highlight
    ? "border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,.8)] scale-[1.02]"
    : isSelected
    ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,.25)]"
    : "border-slate-800/80 hover:border-slate-700"
}`}
    >
      {/* Poster Wrapper - Mobile par width control karega aur chhota dikhega */}
      <div className="relative aspect-[2/3] w-32 sm:w-full flex-shrink-0 overflow-hidden bg-slate-950">
        <img
          src={getPosterUrl(show.poster)}
          alt={show.title}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/500x750/0f172a/94a3b8?text=No+Image";
          }}
        />
        
        {/* Cinematic Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

        {/* Favorite Floating Icon */}
        {show.isFavorite && (
          <div className="absolute right-3 top-3 rounded-xl bg-rose-500/90 backdrop-blur-md p-2 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Heart size={15} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Content Area - Mobile aur Desktop dono ke liye layout handling */}
      <div className="p-4 flex flex-col justify-between flex-1 sm:justify-start">
        <div>
          <h3 className="line-clamp-1 text-base font-bold tracking-tight text-slate-100 transition-colors group-hover:text-white">
            {show.title}
          </h3>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            {show.type === "tv" ? `${show.totalEpisodes || 0} Episodes` : "Movie"}
          </p>
        </div>

        {/* Premium Styled Ratings Section */}
        <div className="mt-3 flex items-center gap-4 border-t border-slate-800/60 pt-3 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold text-amber-400">
              {Number(show.tmdbRating || 0).toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4 sm:pl-6">
            <span className="text-sm">👤</span>
            <span className="text-sm font-bold text-cyan-400">
              {userRating ? Number(userRating).toFixed(1) : "—"}
            </span>
          </div>
        </div>

        {/* Badges Container */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {statusBadge && (
            <span
              className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          )}

          {show.isFavorite && (
            <span className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-rose-400 backdrop-blur-sm">
              ❤️ Favorite
            </span>
          )}

          {sentimentBadge && (
            <span
              className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${sentimentBadge.className}`}
            >
              {sentimentBadge.label}
            </span>
          )}

          {show.rewatchCount > 0 && (
            <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-purple-400 backdrop-blur-sm">
              🔁 {show.rewatchCount}x
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ShowCard;