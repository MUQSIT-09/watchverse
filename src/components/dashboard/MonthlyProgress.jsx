import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLibrary } from "../../utils/libraryStorage";
import {
  getCurrentMonthStreak,
  getHighestMonthStreak,
  getMoviesCompletedThisMonth,
  getSeriesCompletedThisMonth,
  getHoursWatchedThisMonth,
} from "../../utils/stats";

const MonthlyProgress = () => {
  const { user } = useAuth();

  const isLoggedIn = !!user;
  const [library, setLibrary] = useState([]);

useEffect(() => {
  const load = async () => {
    if (!user) {
      setLibrary([]);
      return;
    }

    try {
      const data = await getLibrary(user.uid);
      setLibrary(data);
    } catch (err) {
      console.log("MonthlyProgress getLibrary error:", err);
      setLibrary([]);
    }
  };

  load();
}, [user]);

  const currentStreak = getCurrentMonthStreak(Array.isArray(library) ? library : []);
  const highestStreak = getHighestMonthStreak(Array.isArray(library) ? library : []);
  const moviesCompleted = getMoviesCompletedThisMonth(Array.isArray(library) ? library : []);
  const seriesCompleted = getSeriesCompletedThisMonth(Array.isArray(library) ? library : []);
  const hoursWatched = getHoursWatchedThisMonth(Array.isArray(library) ? library : []);

  // Configuration for cards to ensure both states look premium and consistent
  const cardConfigs = [
    {
      title: "Total Time Watched",
      number: isLoggedIn ? String(hoursWatched) : "0",
      unit: "hrs",
      colorClass: "from-cyan-400 via-blue-500 to-indigo-600",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.12)] hover:border-cyan-500/40",
      numColor: "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-100"
    },
    {
      title: "Movies Completed",
      number: isLoggedIn ? String(moviesCompleted) : "0",
      unit: "titles",
      colorClass: "from-purple-400 via-fuchsia-500 to-pink-600",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(192,38,211,0.12)] hover:border-purple-500/40",
      numColor: "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-100"
    },
    {
      title: "Series Completed",
      number: isLoggedIn ? String(seriesCompleted) : "0",
      unit: "shows",
      colorClass: "from-indigo-400 via-purple-500 to-pink-600",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(99,102,241,0.12)] hover:border-indigo-500/40",
      numColor: "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100"
    },
    {
      title: "Current Streak",
      number: isLoggedIn ? String(currentStreak) : "0",
      unit: "days",
      colorClass: "from-amber-400 via-orange-500 to-red-600",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(245,158,11,0.12)] hover:border-amber-500/40",
      numColor: "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-100"
    },
    {
      title: "Highest Streak",
      number: isLoggedIn ? String(highestStreak) : "0",
      unit: "days",
      colorClass: "from-yellow-400 via-amber-500 to-orange-500",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(234,179,8,0.12)] hover:border-yellow-500/40",
      numColor: "text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-yellow-100"
    },
  ];
  if (!isLoggedIn) {
    return (
      <section className="mb-12 md:mb-16">
        <div className="mb-6 md:mb-8 px-1">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            Monthly Activity
          </h2>
          <p className="mt-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide">
            Start your WatchVerse journey.
          </p>
        </div>

        {/* Premium Grid for Logged out users */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {cardConfigs.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950/80 backdrop-blur-xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between min-h-[120px] sm:min-h-[150px]"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-slate-800 to-slate-700 opacity-40" />
              <div className="flex items-start justify-between">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {item.title}
                </p>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-600">
                  {item.number}
                </h1>
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                  {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Banner matching premium card standards */}
        <div className="mt-8 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 p-8 text-center relative overflow-hidden shadow-xl shadow-black/20">
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Start your WatchVerse journey
          </h3>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Create an account to track shows, build streaks, and unlock statistics.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-6 md:mb-8 px-1">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">
          Monthly Activity
        </h2>
        <p className="mt-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide">
          Track your viewing statistics and watching streaks.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {cardConfigs.map((item) => (
          <div
            key={item.title}
            className={`
              group
              relative
              rounded-2xl
              border
              border-slate-800/50
              bg-gradient-to-b
              from-slate-900/40
              to-slate-950/90
              backdrop-blur-xl
              p-5
              sm:p-6
              overflow-hidden
              transition-all
              duration-300
              hover:-translate-y-1
              flex
              flex-col
              justify-between
              min-h-[120px]
              sm:min-h-[150px]
              ${item.glowColor}
            `}
          >
            {/* Ultra-thin top accent bar */}
            <div
              className={`
                absolute
                top-0
                left-0
                h-[2px]
                w-full
                bg-gradient-to-r
                ${item.colorClass}
                opacity-60
                group-hover:opacity-100
                transition-opacity
                duration-300
              `}
            />

            {/* Bright premium label text spacing */}
            <div className="flex items-start justify-between">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.11em] text-slate-300 group-hover:text-white transition-colors duration-200">
                {item.title}
              </p>
            </div>

            {/* Solid vibrant counters without standard dull text layers */}
            <div className="mt-4 flex items-baseline gap-1.5">
              <h1 className={`text-4xl sm:text-5xl font-black tracking-tight transition-transform duration-300 group-hover:scale-[1.01] ${item.numColor}`}>
                {item.number}
              </h1>
              {item.unit && (
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors tracking-wide uppercase">
                  {item.unit}
                </span>
              )}
            </div>

            {/* Premium backdrop radial glow flare */}
            <div 
              className={`
                absolute 
                -right-6 
                -bottom-6 
                w-16 
                h-16 
                rounded-full 
                bg-gradient-to-br 
                ${item.colorClass} 
                opacity-0 
                group-hover:opacity-[0.08] 
                blur-xl 
                transition-all 
                duration-500
              `} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MonthlyProgress;