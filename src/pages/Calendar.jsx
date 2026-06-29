import React, { useMemo, useState, useEffect } from "react";
import { getUpcoming, getRecentlyReleased, loadExtraPages } from "../services/tmdb";

import { CalendarDays, ChevronDown } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

// Safe namespace import so missing named exports don't throw ReferenceError
import * as dummyData from "../data/dummyData";

import SliderRow from "../components/dashboard/SliderRow";
import PosterCard from "../components/dashboard/PosterCard";

/* ---------- Helpers ---------- */

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const getDaysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const getMonthKey = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date.slice(0, 7);
  if (date instanceof Date) return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return null;
};

const getMonthCalendar = (year, monthIndex) => {
  const totalDays = getDaysInMonth(year, monthIndex);
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const mondayStart = firstDay === 0 ? 6 : firstDay - 1;
  const empty = Array.from({ length: mondayStart });
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  return [...empty, ...days];
};

const getWeeksInMonth = (year, monthIndex) => {
  const totalDays = getDaysInMonth(year, monthIndex);
  const weeks = [];
  let day = 1;
  while (day <= totalDays) {
    weeks.push({
      week: weeks.length + 1,
      start: day,
      end: Math.min(day + 6, totalDays),
    });
    day += 7;
  }
  return weeks;
};

const getWeekRangeDates = (year, monthIndex, weekNumber) => {
  const weeks = getWeeksInMonth(year, monthIndex);
  const selected = weeks.find((item) => item.week === weekNumber);
  if (!selected) return null;
  // start at local midnight and end at local end-of-day
  return {
    start: new Date(year, monthIndex, selected.start, 0, 0, 0, 0),
    end: new Date(year, monthIndex, selected.end, 23, 59, 59, 999),
  };
};

// Parse YYYY-MM-DD into local midnight Date
const parseISODateToLocal = (iso) => {
  if (!iso || typeof iso !== "string") return null;
  const parts = iso.split("-");
  if (parts.length < 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2].slice(0, 2)); // in case time appended
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return new Date(y, m, d, 0, 0, 0, 0);
};

/* ---------- Pure filter for arbitrary week (doesn't depend on component state) ---------- */
const filterShowsInWeek = (shows = [], year, monthIndex, weekNumber, type = "all") => {
  const range = getWeekRangeDates(year, monthIndex, weekNumber);
  if (!range) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return shows.filter((show) => {
    const dateStr = show.release_date || show.first_air_date;
    if (!dateStr) return false;
    const release = parseISODateToLocal(dateStr);
    if (!release) return false;

    if (release < range.start || release > range.end) return false;
    if (type === "recent") return release <= today;
    if (type === "upcoming") return release > today;
    return true;
  });
};

/* ---------- Component ---------- */

const Calendar = () => {
  const currentYear = new Date().getFullYear();
  const START_YEAR = 2016;
  // include a few future years so user can browse 2027/2028/etc.
  const years = Array.from({ length: currentYear - START_YEAR + 4 }, (_, i) => START_YEAR + i);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [openRelease, setOpenRelease] = useState(null);

  const [upcomingShows, setUpcomingShows] = useState([]);
  const [recentShows, setRecentShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // use safe fallbacks for data imported from dummyData
  const calendarEvents = dummyData.calendarEvents || [];
  const libraryShows = dummyData.libraryShows || [];

  useEffect(() => {
    loadReleaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReleaseData = async () => {
    setLoadError(null);
    setLoadingShows(true);
    try {
      const upcoming = await getUpcoming();
      const recent = await getRecentlyReleased();

      // keep items that have a poster (we already filter posterless earlier)
      const normalizedUpcoming = (upcoming.results || []).filter(item => item.poster_path || item.poster).map((item) => ({
        ...item,
        media_type: item.media_type || "movie",
      }));

      const normalizedRecent = (recent.results || []).filter(item => item.poster_path || item.poster).map((item) => ({
        ...item,
        media_type: item.media_type || "tv",
      }));

      // Keep past items from 2016..current year (we include them)
      const filteredRecent = normalizedRecent.filter(item => {
        const dt = parseISODateToLocal(item.release_date || item.first_air_date);
        if (!dt) return false;
        return dt.getFullYear() >= START_YEAR;
      });

      setUpcomingShows(normalizedUpcoming);
      setRecentShows(filteredRecent);
    } catch (err) {
      console.error("Failed to load releases", err);
      setLoadError(err?.message || "Unknown error");
    } finally {
      setLoadingShows(false);
    }
  };

  // background loader for extra pages (same behavior)
  useEffect(() => {
    let page = 11;
    let timer = null;
    const start = async () => {
      timer = setInterval(async () => {
        if (page > 50) {
          clearInterval(timer);
          return;
        }
        try {
          setLoadingExtra(true);
          const data = await loadExtraPages(page, page + 4);

          setUpcomingShows((prev) => {
            const merged = [...prev, ...(data.upcoming || [])];
            return merged.filter(
              (item, index, self) => index === self.findIndex((t) => t.id === item.id && t.media_type === item.media_type)
            );
          });

          setRecentShows((prev) => {
            const merged = [...prev, ...(data.recent || [])];
            return merged.filter(
              (item, index, self) => index === self.findIndex((t) => t.id === item.id && t.media_type === item.media_type)
            );
          });
        } catch (err) {
          console.warn("Failed to load extra pages", err);
        } finally {
          setLoadingExtra(false);
        }
        page += 5;
      }, 60000);
    };

    start();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedMonth(null);
    setSelectedWeek(null);
    setOpenRelease(null);
  }, [selectedYear]);

  const blockClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // original semantics kept but now accepts optional params; not used in render counts
  const filterBySelectedWeek = (shows, type, year = selectedYear, month = selectedMonth, week = selectedWeek) => {
    if (month === null || week === null) return [];
    return filterShowsInWeek(shows, year, month, week, type);
  };

  const upcomingFromLibrary = useMemo(() => {
    return libraryShows
      .filter((show) => show.nextEpisode && (show.isFavorite || show.status === "watching" || show.status === "on_hold"))
      .map((show) => ({
        date: show.nextEpisode.releaseDate,
        title: `${show.title} ${show.nextEpisode.episode}`,
        releaseTime: show.nextEpisode.releaseTime,
        status: show.status,
        isFavorite: show.isFavorite,
      }))
      .filter((event) => event.date && event.date.startsWith(String(selectedYear)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedYear, libraryShows]);

  const eventsByMonth = useMemo(() => {
    const grouped = {};
    const watched = calendarEvents.filter((event) => event.date && event.date.startsWith(String(selectedYear)));
    const all = [...watched, ...upcomingFromLibrary];
    all.forEach((event) => {
      const key = getMonthKey(event.date);
      grouped[key] = [...(grouped[key] || []), event];
    });
    return grouped;
  }, [selectedYear, upcomingFromLibrary, calendarEvents]);

  return (
    <MainLayout>
      <div className="space-y-10 max-w-[1600px] mx-auto px-4 py-6 text-slate-100 antialiased selection:bg-sky-500/30">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-8 shadow-2xl shadow-black/40">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.03),transparent_45%)]" />
  
  {/* Flex structure changed: Mobile par vertical flow, tablet/desktop par side-by-side row */}
  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-10">
    <div>
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-sky-400/90">Show Tracker</p>
      <h1 className="mt-1 sm:mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
        {selectedYear} Watch Calendar
      </h1>
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-400">Personalized upcoming & recently released explorer</p>
    </div>

    {/* Dropdown & Counter Container - Mobile par split rows ya single clean wrap group */}
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto bg-slate-950/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-slate-900 sm:border-none">
      <div className="relative group w-full sm:w-auto">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-full sm:w-auto appearance-none cursor-pointer rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 hover:border-slate-700/80 transition-all duration-300 pl-4 pr-10 py-2.5 sm:py-3 text-sm font-semibold text-slate-200 shadow-inner tracking-wide outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
        >
          {years.map((year) => (
            <option key={year} value={year} className="bg-slate-950 text-slate-200 font-medium">
              {year}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 group-hover:text-slate-200 transition-colors">
          <ChevronDown size={16} strokeWidth={2.5} />
        </div>
      </div>

      {/* Stats values - Mobile view par shrink/wrap text crash block fixed */}
      <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 px-1 sm:px-0 font-medium">
        <span className="truncate">
          <strong className="font-bold text-slate-200">{(upcomingShows || []).length}</strong> upcoming
        </span>
        <span className="text-slate-700 font-black">•</span>
        <span className="truncate">
          <strong className="font-bold text-slate-200">{(recentShows || []).length}</strong> recent
        </span>
      </div>
    </div>
  </div>
</section>

        {/* CONTENT GRID */}
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
          {/* MONTHS GRID CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl shadow-black/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {months.map((month, monthIndex) => {
                const calendarDays = getMonthCalendar(selectedYear, monthIndex);
                const isSelected = selectedMonth === monthIndex;

                return (
                  <div key={month} className="flex flex-col">
                    <button
                      onClick={() => {
                        setSelectedMonth(monthIndex);
                        setSelectedWeek(null);
                        setOpenRelease(null);
                      }}
                      className={`group relative w-full h-full rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? "border-sky-500/60 bg-gradient-to-b from-sky-500/10 to-sky-500/[0.02] shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/30"
                          : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700/60 shadow-sm"
                      }`}
                    >
                      <div>
                        <h3 className={`font-bold tracking-wide transition-colors ${isSelected ? "text-sky-400 text-lg" : "text-slate-200 group-hover:text-white text-base"}`}>
                          {month}
                        </h3>

                        <div className="mt-4 grid grid-cols-7 gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                            <div key={day} className="text-center">{day}</div>
                          ))}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-1">
                          {calendarDays.map((day, index) => (
                            <div
                              key={`${monthIndex}-${index}`}
                              className={`aspect-square flex items-center justify-center rounded text-[10px] font-medium transition-all ${
                                day
                                  ? isSelected
                                    ? "bg-sky-500/15 text-sky-200 font-semibold"
                                    : "bg-slate-900/80 text-slate-400 group-hover:text-slate-300"
                                  : "bg-transparent opacity-0"
                              }`}
                            >
                              {day || ""}
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 text-[11px] font-medium text-slate-500 tracking-wide">{getDaysInMonth(selectedYear, monthIndex)} Days</p>
                    </button>

                    {/* MOBILE WEEKS & SLIDER DRAWER */}
                    {isSelected && (
                      <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 lg:hidden animate-fadeIn space-y-3">
                        <h2 className="text-lg font-bold text-white tracking-wide">{month} {selectedYear}</h2>
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 subtle-scrollbar">
                          {getWeeksInMonth(selectedYear, monthIndex).map((item) => {
                            const status = (() => {
                              const range = getWeekRangeDates(selectedYear, monthIndex, item.week);
                              if (!range) return null;
                              const today = new Date(); today.setHours(0, 0, 0, 0);
                              if (today >= range.start && today <= range.end) return "mixed";
                              if (range.end < today) return "past";
                              return "future";
                            })();

                            const upcomingCount = filterShowsInWeek(upcomingShows, selectedYear, monthIndex, item.week, "upcoming").length;
                            const recentCount = filterShowsInWeek(recentShows, selectedYear, monthIndex, item.week, "recent").length;

                            const isMobileWeekActive = selectedWeek === item.week;

                            return (
                              <div key={item.week} className="space-y-2">
                                <button
                                  onClick={() => {
                                    setSelectedWeek(item.week);
                                    // PRIORITY CHANGE: open 'recent' first for past weeks if there are items,
                                    // otherwise open 'upcoming' if there are upcoming items.
                                    if (recentCount > 0) {
                                      setOpenRelease("recent");
                                    } else if (upcomingCount > 0) {
                                      setOpenRelease("upcoming");
                                    } else {
                                      setOpenRelease(null);
                                    }
                                  }}
                                  className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                                    isMobileWeekActive ? "border-sky-500/50 bg-slate-900 shadow-inner" : "border-slate-800 bg-slate-900/40 hover:bg-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-white">Week {item.week}</div>
                                    <div className="flex items-center gap-2">
                                      {status === "mixed" && (
                                        <span className="flex h-2 w-2 relative">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                      )}
                                      <div className="text-[11px] text-slate-400">{item.start} - {item.end}</div>
                                    </div>
                                  </div>
                                </button>

                                {/* MOBILE ACCORDION INNER SLIDERS */}
                                {isMobileWeekActive && (
                                  <div className="mt-2 pl-2 space-y-2 border-l border-slate-800 ml-2 animate-fadeIn">
                                    {status !== "past" && (
                                      <button
                                        onClick={() => setOpenRelease(openRelease === "upcoming" ? null : "upcoming")}
                                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs font-semibold tracking-wide transition-all ${
                                          openRelease === "upcoming" ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-slate-900 border-slate-800 text-slate-300"
                                        }`}
                                      >
                                        <span>Upcoming Releases ({upcomingCount})</span>
                                        <ChevronDown size={14} className={`transform transition-transform ${openRelease === "upcoming" ? "rotate-180" : ""}`} />
                                      </button>
                                    )}

                                    {status !== "past" && (
                                      <button
                                        onClick={() => setOpenRelease(openRelease === "recent" ? null : "recent")}
                                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs font-semibold tracking-wide transition-all ${
                                          openRelease === "recent" ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-slate-900 border-slate-800 text-slate-300"
                                        }`}
                                      >
                                        <span>Recently Released ({recentCount})</span>
                                        <ChevronDown size={14} className={`transform transition-transform ${openRelease === "recent" ? "rotate-180" : ""}`} />
                                      </button>
                                    )}

                                    {openRelease === "upcoming" && (status === "future" || status === "mixed") && (
  <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 -mx-4 px-4">
    <SliderRow title="Upcoming Releases">
      {filterShowsInWeek(upcomingShows, selectedYear, monthIndex, item.week, "upcoming").length === 0 ? (
        <p className="text-xs text-slate-500 italic p-2">No upcoming releases this week.</p>
      ) : (
        filterShowsInWeek(upcomingShows, selectedYear, monthIndex, item.week, "upcoming").map((show) => (
          <PosterCard key={`${show.media_type}-${show.id}`} item={show} />
        ))
      )}
    </SliderRow>
  </div>
)}
                                    {openRelease === "recent" && (status === "past" || status === "mixed") && (
                                      <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
                                        <SliderRow title="Recently Released">
                                          {filterShowsInWeek(recentShows, selectedYear, monthIndex, item.week, "recent").length === 0 ? (
                                            <p className="text-xs text-slate-500 italic p-2">No recently released shows.</p>
                                          ) : (
                                            filterShowsInWeek(recentShows, selectedYear, monthIndex, item.week, "recent").map((show) => (
                                              <div key={`${show.media_type}-${show.id}`} onClickCapture={blockClick} className="cursor-default inline-block">
                                                <PosterCard item={show} />
                                              </div>
                                            ))
                                          )}
                                        </SliderRow>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR EXPLORER (DESKTOP ONLY) */}
          <aside className="hidden lg:block rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl shadow-black/30 self-start sticky top-6">
            {selectedMonth === null ? (
              <div className="flex min-h-[450px] flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <div className="p-4 rounded-2xl bg-sky-500/5 text-sky-400 ring-1 ring-sky-500/10 shadow-inner">
                  <CalendarDays size={32} />
                </div>
                <h2 className="mt-5 text-lg font-bold text-white tracking-wide">No Month Selected</h2>
                <p className="mt-2 text-sm text-slate-400 max-w-[220px]">Click on any month card to explore scheduled releases and timeline events.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800/80">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">Timeline</p>
                  <h2 className="text-2xl font-black text-white tracking-wide mt-1">{months[selectedMonth]} {selectedYear}</h2>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 subtle-scrollbar">
                  {getWeeksInMonth(selectedYear, selectedMonth).map((item) => {
                    const status = (() => {
                      const range = getWeekRangeDates(selectedYear, selectedMonth, item.week);
                      if (!range) return null;
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      if (today >= range.start && today <= range.end) return "mixed";
                      if (range.end < today) return "past";
                      return "future";
                    })();

                    const upcomingCount = filterShowsInWeek(upcomingShows, selectedYear, selectedMonth, item.week, "upcoming").length;
                    const recentCount = filterShowsInWeek(recentShows, selectedYear, selectedMonth, item.week, "recent").length;
                    const isWeekActive = selectedWeek === item.week;

                    return (
                      <div key={item.week} className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedWeek(item.week);
                            // PRIORITY CHANGE: open recent first if any, otherwise upcoming
                            if (recentCount > 0) {
                              setOpenRelease("recent");
                            } else if (upcomingCount > 0) {
                              setOpenRelease("upcoming");
                            } else {
                              setOpenRelease(null);
                            }
                          }}
                          className={`w-full rounded-xl border p-4 text-left transition-all duration-300 relative group/week ${
                            isWeekActive ? "border-sky-500/50 bg-slate-950 shadow-inner" : "border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold tracking-wide ${isWeekActive ? "text-sky-400" : "text-slate-200"}`}>Week {item.week}</span>
                            <div className="flex items-center gap-3">
                              {status === "mixed" && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}
                              {status === "past" && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Past</span>}
                            </div>
                          </div>
                          <p className="text-xs font-medium text-slate-400 mt-1">Timeline: <span className="text-slate-300">{item.start}</span> to <span className="text-slate-300">{item.end}</span></p>
                        </button>

                        {/* DESKTOP ACCORDION EXPANSION */}
                        {isWeekActive && (
                          <div className="mt-2 pl-2 space-y-2 border-l border-slate-800/80 ml-4 animate-fadeIn">
                            {status !== "past" && (
                              <button
                                onClick={() => setOpenRelease(openRelease === "upcoming" ? null : "upcoming")}
                                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-xs font-semibold tracking-wide transition-all ${
                                  openRelease === "upcoming" ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                                }`}
                              >
                                <span>Upcoming Releases ({upcomingCount})</span>
                                <ChevronDown size={14} className={`transform transition-transform duration-200 ${openRelease === "upcoming" ? "rotate-180" : ""}`} />
                              </button>
                            )}

                            {status !== "past" && (
                              <button
                                onClick={() => setOpenRelease(openRelease === "recent" ? null : "recent")}
                                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-xs font-semibold tracking-wide transition-all ${
                                  openRelease === "recent" ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                                }`}
                              >
                                <span>Recently Released ({recentCount})</span>
                                <ChevronDown size={14} className={`transform transition-transform duration-200 ${openRelease === "recent" ? "rotate-180" : ""}`} />
                              </button>
                            )}

                            {openRelease === "upcoming" && (status === "future" || status === "mixed") && (
                              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                                <SliderRow title="Upcoming Releases">
                                  {filterShowsInWeek(upcomingShows, selectedYear, selectedMonth, item.week, "upcoming").length === 0 ? (
                                    <p className="text-xs text-slate-500 italic p-3">No upcoming releases scheduled this week.</p>
                                  ) : (
                                    filterShowsInWeek(upcomingShows, selectedYear, selectedMonth, item.week, "upcoming").map((show) => (
                                      <div key={`${show.media_type}-${show.id}`} onClickCapture={blockClick} className="cursor-default">
                                        <PosterCard item={show} />
                                      </div>
                                    ))
                                  )}
                                </SliderRow>
                              </div>
                            )}

                            {openRelease === "recent" && (status === "past" || status === "mixed") && (
                              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                                <SliderRow title="Recently Released">
                                  {filterShowsInWeek(recentShows, selectedYear, selectedMonth, item.week, "recent").length === 0 ? (
                                    <p className="text-xs text-slate-500 italic p-3">No recently released shows discovered.</p>
                                  ) : (
                                    filterShowsInWeek(recentShows, selectedYear, selectedMonth, item.week, "recent").map((show) => (
                                      <div key={`${show.media_type}-${show.id}`} onClickCapture={blockClick} className="cursor-default">
                                        <PosterCard item={show} />
                                      </div>
                                    ))
                                  )}
                                </SliderRow>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </section>

        {/* Loading & Error states */}
        {loadingShows && (
          <div className="text-sm text-slate-400">Loading releases...</div>
        )}
        {loadError && (
          <div className="text-sm text-rose-400">Failed to load releases: {loadError}</div>
        )}
        {loadingExtra && (
          <div className="text-xs text-slate-400">Background pages loading...</div>
        )}
      </div>
    </MainLayout>
  );
};

export default Calendar;

// import {
//   useMemo,
//   useState,
//   useEffect
// } from "react";

// import {
//   CalendarDays,
//   ChevronDown,
// } from "lucide-react";

// import MainLayout from "../components/layout/MainLayout";

// import {
//   calendarEvents,
//   libraryShows
// } from "../data/dummyData";

// import SliderRow from "../components/dashboard/SliderRow";
// import PosterCard from "../components/dashboard/PosterCard";

// import {
//   getUpcoming,
//   getRecentlyReleased,
// } from "../services/tmdb";



// const months = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];



// const getDaysInMonth = (
//   year,
//   monthIndex
// ) =>
// new Date(
//   year,
//   monthIndex + 1,
//   0
// ).getDate();




// const getMonthKey = (
//   date
// )=>
// date.slice(0,7);





// const getMonthCalendar = (
//   year,
//   monthIndex
// )=>{


// const totalDays =
// getDaysInMonth(
// year,
// monthIndex
// );



// const firstDay =
// new Date(
// year,
// monthIndex,
// 1
// ).getDay();



// const mondayStart =
// firstDay === 0
// ?
// 6
// :
// firstDay - 1;



// const empty =
// Array.from({
//   length:mondayStart
// });



// const days =
// Array.from(
// {
// length:totalDays
// },
// (_,i)=>i+1
// );



// return [
// ...empty,
// ...days
// ];


// };






// const getWeeksInMonth = (
// year,
// monthIndex
// )=>{


// const totalDays =
// getDaysInMonth(
// year,
// monthIndex
// );



// const weeks=[];

// let day=1;



// while(day<=totalDays){


// weeks.push({

// week:
// weeks.length + 1,

// start:
// day,

// end:
// Math.min(
// day+6,
// totalDays
// )

// });


// day += 7;


// }



// return weeks;


// };







// const getWeekRangeDates = (
// year,
// monthIndex,
// weekNumber
// )=>{


// const weeks =
// getWeeksInMonth(
// year,
// monthIndex
// );



// const selected =
// weeks.find(
// (item)=>
// item.week === weekNumber
// );



// if(!selected)
// return null;



// return {


// start:
// new Date(
// year,
// monthIndex,
// selected.start
// ),



// end:
// new Date(
// year,
// monthIndex,
// selected.end
// )


// };



// };







// const getWeekStatus = (
// year,
// monthIndex,
// weekNumber
// )=>{


// const range =
// getWeekRangeDates(
// year,
// monthIndex,
// weekNumber
// );



// if(!range)
// return null;



// const today =
// new Date();



// today.setHours(
// 0,
// 0,
// 0,
// 0
// );



// if(
// range.end < today
// ){

// return "past";

// }



// if(
// range.start > today
// ){

// return "future";

// }



// return "current";


// };









// const Calendar = ()=>{


// const currentYear =
// new Date().getFullYear();




// const [
// selectedYear,
// setSelectedYear
// ]=useState(
// currentYear
// );




// const [
// selectedMonth,
// setSelectedMonth
// ]=useState(
// null
// );




// const [
// selectedWeek,
// setSelectedWeek
// ]=useState(
// null
// );




// const [
// openRelease,
// setOpenRelease
// ]=useState(
// null
// );




// const [
// upcomingShows,
// setUpcomingShows
// ]=useState(
// []
// );



// const [
// recentShows,
// setRecentShows
// ]=useState(
// []
// );




// const [
// loadingShows,
// setLoadingShows
// ]=useState(
// false
// );





// const years =
// Array.from(
// {
// length:10
// },
// (_,i)=>
// currentYear+i
// );







// useEffect(()=>{


// loadReleaseData();


// },[]);







// const loadReleaseData =
// async()=>{


// try{


// setLoadingShows(true);



// const upcoming =
// await getUpcoming();



// const recent =
// await getRecentlyReleased();




// setUpcomingShows(

// (upcoming.results || [])

// .map(item=>({

// ...item,

// media_type:
// item.media_type ||
// "movie"

// }))

// );





// setRecentShows(

// (recent.results || [])

// .map(item=>({

// ...item,

// media_type:
// item.media_type ||
// "tv"

// }))

// );





// }


// catch(error){

// console.log(error);

// }



// finally{

// setLoadingShows(false);

// }



// };







// const filterBySelectedWeek = (
// shows,
// type
// )=>{


// if(
// selectedMonth === null ||
// selectedWeek === null
// )
// return [];




// const range =
// getWeekRangeDates(
// selectedYear,
// selectedMonth,
// selectedWeek
// );




// if(!range)
// return [];




// const today =
// new Date();



// today.setHours(
// 0,
// 0,
// 0,
// 0
// );




// return shows.filter(
// (show)=>{



// const date =
// show.release_date ||
// show.first_air_date;



// if(!date)
// return false;




// const release =
// new Date(date);



// const insideWeek =
// release >= range.start &&
// release <= range.end;




// if(!insideWeek)
// return false;




// if(type==="upcoming"){


// return release > today;


// }




// if(type==="recent"){


// return release <= today;


// }



// return true;


// }

// );


// };

// const upcomingFromLibrary =
// useMemo(()=>{


// return libraryShows

// .filter(
// (show)=>

// show.nextEpisode &&

// (
// show.isFavorite ||

// show.status==="watching" ||

// show.status==="on_hold"

// )

// )


// .map(show=>({

// date:
// show.nextEpisode.releaseDate,


// title:
// `${show.title} ${show.nextEpisode.episode}`,


// releaseTime:
// show.nextEpisode.releaseTime,


// status:
// show.status,


// isFavorite:
// show.isFavorite


// }))


// .filter(event=>

// event.date.startsWith(
// String(selectedYear)
// )

// )



// .sort(
// (a,b)=>
// a.date.localeCompare(
// b.date
// )

// );


// },[
// selectedYear
// ]);







// const eventsByMonth =
// useMemo(()=>{


// const grouped={};



// const watched =
// calendarEvents.filter(
// (event)=>

// event.date.startsWith(
// String(selectedYear)
// )

// );



// const all=[

// ...watched,

// ...upcomingFromLibrary

// ];



// all.forEach(event=>{


// const key =
// getMonthKey(
// event.date
// );



// grouped[key]=[

// ...(grouped[key]||[]),

// event

// ];


// });



// return grouped;


// },[
// selectedYear,
// upcomingFromLibrary
// ]);







// return (

// <MainLayout>


// <div className="space-y-8">



// <section
// className="
// rounded-3xl
// border
// border-slate-800
// bg-slate-900
// p-6
// "
// >


// <div
// className="
// flex
// flex-col
// gap-5
// lg:flex-row
// lg:justify-between
// "
// >



// <div>

// <p
// className="
// text-sm
// font-semibold
// uppercase
// tracking-[0.18em]
// text-sky-400
// "
// >

// Calendar

// </p>


// <h1
// className="
// mt-2
// text-3xl
// font-bold
// text-white
// "
// >

// {selectedYear}
// Watch Calendar

// </h1>


// <p
// className="
// mt-3
// text-slate-400
// "
// >

// Upcoming & recently released explorer

// </p>


// </div>





// <select

// value={selectedYear}

// onChange={(e)=>{


// setSelectedYear(
// Number(e.target.value)
// );


// setSelectedMonth(null);

// setSelectedWeek(null);

// setOpenRelease(null);


// }}


// className="
// rounded-xl
// bg-slate-800
// px-4
// py-3
// text-white
// "

// >


// {

// years.map(year=>(


// <option
// key={year}
// value={year}
// >

// {year}

// </option>


// ))

// }


// </select>


// </div>


// </section>







// <section
// className="
// grid
// grid-cols-1
// gap-6

// xl:grid-cols-[1fr_380px]

// "
// >



// <div
// className="
// rounded-3xl
// border
// border-slate-800
// bg-slate-900
// p-5
// "
// >



// <div
// className="
// grid
// grid-cols-2
// sm:grid-cols-3
// gap-3
// "
// >



// {

// months.map(
// (month,monthIndex)=>{


// const calendarDays =
// getMonthCalendar(
// selectedYear,
// monthIndex
// );



// return (


// <div
// key={month}
// >


// <button

// onClick={()=>{


// setSelectedMonth(
// monthIndex
// );


// setSelectedWeek(null);


// setOpenRelease(null);


// }}


// className={`

// w-full

// rounded-2xl

// border

// p-4

// text-left


// ${
// selectedMonth===monthIndex

// ?

// "border-sky-500 bg-sky-500/10"

// :

// "border-slate-700 bg-slate-800"

// }

// `}

// >



// <h3 className="font-bold text-white">

// {month}

// </h3>




// <div
// className="
// mt-3
// grid
// grid-cols-7
// gap-1
// text-[10px]
// text-slate-500
// "
// >


// {

// [
// "Mo",
// "Tu",
// "We",
// "Th",
// "Fr",
// "Sa",
// "Su"

// ].map(day=>(


// <div
// key={day}
// className="text-center"
// >

// {day}

// </div>


// ))


// }



// </div>




// <div
// className="
// mt-2
// grid
// grid-cols-7
// gap-1
// "
// >


// {

// calendarDays.map(
// (day,index)=>(


// <div

// key={index}

// className="
// aspect-square
// flex
// items-center
// justify-center
// rounded
// bg-slate-900
// text-xs
// text-slate-400
// "

// >

// {day || ""}


// </div>


// ))


// }


// </div>




// <p
// className="
// mt-3
// text-xs
// text-slate-400
// "
// >

// {
// getDaysInMonth(
// selectedYear,
// monthIndex
// )
// }

// Days

// </p>



// </button>







// {

// selectedMonth===monthIndex && (


// <div
// className="
// mt-4
// rounded-3xl
// bg-slate-950
// p-4
// lg:hidden
// "
// >



// <h2 className="text-xl font-bold text-white">

// {month}
// {selectedYear}

// </h2>



// {

// getWeeksInMonth(
// selectedYear,
// monthIndex
// )

// .map(item=>(


// <button

// key={item.week}

// onClick={()=>{


// setSelectedWeek(
// item.week
// );


// setOpenRelease(null);


// }}


// className="
// mt-3
// w-full
// rounded-xl
// bg-slate-800
// p-4
// text-left
// text-white
// "

// >


// Week {item.week}


// <p className="text-sm text-slate-400">

// {item.start}
// -
// {item.end}

// </p>



// </button>


// ))


// }



// </div>


// )


// }



// </div>


// )


// }


// )

// }


// </div>


// </div>








// <aside
// className="
// hidden
// lg:block
// rounded-3xl
// border
// border-slate-800
// bg-slate-900
// p-6
// "
// >


// {

// selectedMonth===null ?



// <div
// className="
// flex
// min-h-[300px]
// flex-col
// items-center
// justify-center
// text-center
// "
// >


// <CalendarDays
// size={45}
// className="text-sky-400"
// />



// <h2 className="mt-4 text-xl font-bold text-white">

// Select a Month

// </h2>



// <p className="text-slate-400">

// Explore releases

// </p>



// </div>




// :



// <>



// <h2 className="text-2xl font-bold text-white">

// {months[selectedMonth]}
// {selectedYear}

// </h2>




// {

// getWeeksInMonth(
// selectedYear,
// selectedMonth
// )

// .map(item=>{


// const status =
// getWeekStatus(
// selectedYear,
// selectedMonth,
// item.week
// );



// return (

// <div key={item.week}>


// <button

// onClick={()=>{


// setSelectedWeek(
// item.week
// );


// setOpenRelease(null);


// }}


// className="

// mt-4

// w-full

// rounded-xl

// bg-slate-800

// p-4

// text-left

// text-white

// "

// >


// Week {item.week}


// <p className="text-sm text-slate-400">

// {item.start}
// -
// {item.end}

// </p>



// </button>






// {

// selectedWeek===item.week && (



// <div className="mt-3 space-y-3">



// {

// status !== "past" && (



// <button

// onClick={()=>setOpenRelease(
// openRelease==="upcoming"
// ?
// null
// :
// "upcoming"
// )}

// className="
// flex
// w-full
// justify-between
// rounded-xl
// bg-slate-800
// p-4
// text-white
// "

// >


// Upcoming Releases

// <ChevronDown size={18}/>


// </button>



// )


// }





// {

// status !== "future" && (



// <button

// onClick={()=>setOpenRelease(
// openRelease==="recent"
// ?
// null
// :
// "recent"
// )}

// className="
// flex
// w-full
// justify-between
// rounded-xl
// bg-slate-800
// p-4
// text-white
// "

// >


// Recently Released


// <ChevronDown size={18}/>


// </button>



// )


// }





// {

// openRelease==="upcoming" && status!=="past" && (



// <SliderRow title="Upcoming Releases">


// {

// filterBySelectedWeek(
// upcomingShows,
// "upcoming"
// )

// .length === 0 ?


// <p className="text-sm text-slate-400">

// No upcoming releases this week.

// </p>



// :


// filterBySelectedWeek(
// upcomingShows,
// "upcoming"
// )

// .map(show=>(


// <PosterCard

// key={show.id}

// item={show}

// />


// ))


// }



// </SliderRow>



// )



// }





// {

// openRelease==="recent" && status!=="future" && (



// <SliderRow title="Recently Released">


// {

// filterBySelectedWeek(
// recentShows,
// "recent"
// )

// .length === 0 ?


// <p className="text-sm text-slate-400">

// No recently released shows.

// </p>



// :


// filterBySelectedWeek(
// recentShows,
// "recent"
// )

// .map(show=>(


// <PosterCard

// key={show.id}

// item={show}

// />


// ))


// }



// </SliderRow>



// )



// }




// </div>



// )


// }



// </div>



// )


// })

// }



// </>



// }



// </aside>



// </section>



// </div>


// </MainLayout>

// );


// };


// export default Calendar;