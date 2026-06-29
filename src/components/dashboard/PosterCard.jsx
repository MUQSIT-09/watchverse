import { useNavigate } from "react-router-dom";

const PosterCard = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const tab = item.status === "rewatch" ? "watching" : item.status;
    navigate(`/library?tab=${tab}&show=${item.id ?? item.tmdbId}`);
  };

  // 1. Safe Image Path Checking
  const cleanPath = (path) => {
    if (!path) return null;
    return path.startsWith("/") ? path : `/${path}`;
  };

  const imagePath = item.poster_path || item.poster || item.posterPath;
  
  // यहाँ अगर इमेज पाथ है तभी URL बनेगा, वरना हम इसे null रखेंगे ताकि कस्टम UI दिखा सकें
  const image = imagePath
    ? `https://image.tmdb.org/t/p/w500${cleanPath(imagePath)}`
    : null;

  // 2. Year निकालना
  const dateStr = item.release_date || item.first_air_date || item.releaseDate || "";
  const year = dateStr ? dateStr.slice(0, 4) : "";

  // 3. Media Type पहचानना
  let mediaType = item.media_type || item.type || "";
  if (mediaType.toLowerCase() === "movie") {
    mediaType = "Movie";
  } else if (mediaType.toLowerCase() === "tv" || mediaType.toLowerCase() === "tvshow") {
    mediaType = "TV Series";
  } else {
    mediaType = mediaType ? mediaType.toUpperCase() : "";
  }

  const titleText = item.title || item.name || "Untitled";

  return (
    <div
      onClick={handleClick}
      className="
        min-w-[180px]
        md:min-w-[220px]
        lg:min-w-[260px]
        snap-start
        group
        cursor-pointer
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          aspect-[2/3]
          bg-slate-950
        "
      >
        {/* --- शर्त (Condition): अगर इमेज है तो <img> टैग दिखेगा, नहीं तो कस्टम फॉलबैक --- */}
        {image ? (
          <img
            src={image}
            alt={titleText}
            className="
              h-[260px]
              md:h-[320px]
              lg:h-[380px]
              w-full
              object-cover
              duration-500
              group-hover:scale-105
            "
            loading="lazy"
          />
        ) : (
          /* --- पोस्टर नहीं होने पर दिखने वाला ख़ूबसूरत डिज़ाइन --- */
          <div className="
            h-[260px]
            md:h-[320px]
            lg:h-[380px]
            w-full 
            flex 
            flex-col 
            items-center 
            justify-between 
            p-4 
            text-center 
            bg-gradient-to-br from-slate-900 via-zinc-900 to-neutral-950
            border border-zinc-800/50
            rounded-2xl
            duration-500
            group-hover:scale-105
          ">
            {/* ऊपर एक छोटा आइकॉन */}
            <div className="mt-8 text-zinc-600 group-hover:text-sky-500 transition-colors duration-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"></rect>
                <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"></path>
              </svg>
            </div>

            {/* बीच में मूवी का नाम (ताकि खाली न लगे) */}
            <p className="text-sm md:text-base font-medium text-zinc-400 px-2 line-clamp-3">
              {titleText}
            </p>

            {/* नीचे स्पेसिंग बैलेंस करने के लिए खाली डिव */}
            <div className="h-8"></div>
          </div>
        )}

        {/* बॉटम शैडो ग्रैडिएंट (यह इमेज और फॉलबैक दोनों पर काम करेगा) */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/90
            via-black/20
            to-transparent
            pointer-events-none
          "
        />

        {/* Media Type और Year का बैज */}
        <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2">
          {mediaType && (
            <span className="px-2 py-0.5 rounded-md bg-sky-500 text-[11px] font-bold text-white shadow-md uppercase tracking-wider">
              {mediaType}
            </span>
          )}
          {year && (
            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
              {year}
            </span>
          )}
        </div>
      </div>

      {/* नीचे का मेन टाइटल */}
      <h3
        className="
          mt-3
          line-clamp-2
          text-sm
          md:text-lg
          font-semibold
          text-white
          group-hover:text-sky-400
          transition-colors
        "
      >
        {titleText}
      </h3>
    </div>
  );
};

export default PosterCard;