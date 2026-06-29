export const getPosterUrl = (poster) => {
  if (!poster) {
    return "https://placehold.co/500x750/0f172a/94a3b8?text=No+Image";
  }

  return poster.startsWith("http")
    ? poster
    : `https://image.tmdb.org/t/p/w500${poster}`;
};