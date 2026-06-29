export const formatTime = (seconds = 0) => {
  seconds = Math.max(0, Number(seconds) || 0);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const getRuntimeSeconds = (show) => {
  if (!show) return 0;

  // TMDB movie runtime usually minutes
  if (show.type === "movie") {
    return show.runtime > 500
      ? show.runtime
      : show.runtime * 60;
  }

  // TV runtime
  const epRuntime =
    show.episode_run_time?.[0] ||
    show.runtime ||
    45;

  return epRuntime > 500
    ? epRuntime
    : epRuntime * 60;
};