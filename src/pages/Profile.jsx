import React, { useRef, useState, useEffect } from "react";
import { getLibrary, flushOfflineQueue } from "../utils/libraryStorage";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";

import {
  getTotalMoviesCompleted,
  getTotalSeriesCompleted,
  getTotalHoursWatched,
  getHighestStreak,
  getMoviesCompletedThisMonth,
  getSeriesCompletedThisMonth,
  getHoursWatchedThisMonth,
  getCurrentStreak,
  getHeatMap,
} from "../utils/stats";

// Card component
const Card = ({ title, value, unit, accent }) => (
  <div className="group relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-slate-950/90 p-6 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]">
    <div className={`absolute top-0 left-0 h-[2.5px] w-full bg-gradient-to-r ${accent} opacity-60 group-hover:opacity-100 transition-all`} />
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">{title}</p>
    <div className="mt-3 flex items-baseline gap-1.5">
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">{value}</h2>
      <span className="text-xs font-bold text-slate-500">{unit}</span>
    </div>
  </div>
);

const Profile = () => {
  const scrollGraphRef = useRef(null);
  const { user } = useAuth();

  const [library, setLibrary] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadLibrary = async () => {
      if (!user) {
        setLibrary([]);
        return;
      }
      try {
        const data = await getLibrary(user.uid);
        if (!mounted) return;
        setLibrary(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed loading library in Profile:", e);
        if (mounted) setLibrary([]);
      }
    };

    loadLibrary();

    // Listen for library updates from other components
    const onUpdated = () => {
      loadLibrary();
    };

    window.addEventListener("watchverse:libraryUpdated", onUpdated);

    // Try flushing any offline queue when profile mounts
    flushOfflineQueue();

    // Also flush on network reconnect
    const onOnline = () => {
      flushOfflineQueue();
      loadLibrary();
    };
    window.addEventListener("online", onOnline);

    return () => {
      mounted = false;
      window.removeEventListener("watchverse:libraryUpdated", onUpdated);
      window.removeEventListener("online", onOnline);
    };
  }, [user]);

  // rest of Profile uses stats utils
  const joinedDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;

  const memberSince = joinedDate
    ? joinedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "-";

  const firstActivity = joinedDate
    ? joinedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "-";

  const isLoggedIn = !!user;

  const totalMovies = isLoggedIn ? getTotalMoviesCompleted(library) : 0;
  const totalSeries = isLoggedIn ? getTotalSeriesCompleted(library) : 0;
  const totalHours = isLoggedIn ? getTotalHoursWatched(library) : 0;
  const highestStreak = isLoggedIn ? getHighestStreak(library) : 0;
  const monthMovies = isLoggedIn ? getMoviesCompletedThisMonth(library) : 0;
  const monthSeries = isLoggedIn ? getSeriesCompletedThisMonth(library) : 0;
  const monthHours = isLoggedIn ? getHoursWatchedThisMonth(library) : 0;
  const currentStreak = isLoggedIn ? getCurrentStreak(library) : 0;
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const heatMap = isLoggedIn ? getHeatMap(library, selectedYear) || {} : {};

  // generate grid (keeps same logic you had)
  const generateGitHubGrid = () => {
    const today = new Date();
    const totalWeeks = 53;
    const weeksArray = [];

    const currentDayOfWeek = today.getDay();
    const normalizedTarget = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const totalDaysToRender = totalWeeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDaysToRender + normalizedTarget + 1);

    let currentTrackDate = new Date(startDate);
    let lastRenderedMonth = "";
    let lastRenderedWeekIndex = -10;
    const uniqueMonthsWithIndex = [];

    for (let w = 0; w < totalWeeks; w++) {
      const weekDaysData = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = currentTrackDate.toISOString().split("T")[0];
        const active = heatMap[dateKey] || 0;
        const currentMonthName = currentTrackDate.toLocaleString("en-US", { month: "short" });

        if (currentMonthName !== lastRenderedMonth && (d === 0 || currentTrackDate.getDate() <= 7) && (w - lastRenderedWeekIndex >= 3)) {
          uniqueMonthsWithIndex.push({ name: currentMonthName, weekIndex: w });
          lastRenderedMonth = currentMonthName;
          lastRenderedWeekIndex = w;
        }

        weekDaysData.push({ dateKey, active });
        currentTrackDate.setDate(currentTrackDate.getDate() + 1);
      }
      weeksArray.push(weekDaysData);
    }

    return { weeksArray, monthLabels: uniqueMonthsWithIndex };
  };

  const { weeksArray, monthLabels } = generateGitHubGrid();

  const handleGraphWheel = (e) => {
    if (scrollGraphRef.current) {
      scrollGraphRef.current.scrollLeft += e.deltaY;
    }
  };

  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <section className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#111827]/80 via-[#0f172a]/90 to-[#090d1a] p-8 md:p-12 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-5xl font-black text-slate-300">?</div>
              <h1 className="mt-6 text-3xl md:text-5xl font-black text-white">Guest User</h1>
              <p className="mt-4 text-slate-400 max-w-md">Sign in to track your movies, watching streaks and activity.</p>
            </div>
          </section>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-12 max-w-7xl mx-auto px-1 pb-10">
        <section className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#111827]/80 via-[#0f172a]/90 to-[#090d1a] p-8 md:p-12 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="h-28 w-28 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 uppercase">
              {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
            </div>
            <h1 className="mt-6 text-3xl md:text-5xl font-black tracking-tight text-white">{user.displayName}</h1>
            <p className="mt-2.5 font-bold tracking-wider text-xs uppercase bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">WatchVerse Explorer</p>

            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-1 text-left sm:text-center text-xs md:text-sm text-slate-400 border-t border-slate-800/60 pt-6">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Member Since</span>
                <span className="font-semibold text-slate-200">{memberSince}</span>
              </div>
              <div className="border-l border-slate-800/80 pl-8 sm:pl-8">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">First Activity</span>
                <span className="font-semibold text-slate-200">{firstActivity}</span>
              </div>
            </div>
          </div>
        </section>

        {/* LIFETIME METRICS */}
        <section>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300/90 px-1">LIFETIME STATS</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <Card title="Duration" value={`${totalHours}`} unit="hrs" accent="from-cyan-500 to-blue-600" />
            <Card title="Movies" value={totalMovies} unit="titles" accent="from-purple-500 to-pink-600" />
            <div className="col-span-2 md:col-span-1">
              <Card title="Series" value={totalSeries} unit="shows" accent="from-indigo-500 to-purple-600" />
            </div>
          </div>
        </section>

        {/* THIS MONTH METRICS */}
        <section>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300/90 px-1">THIS MONTH ACTIVITY</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <Card title="Duration" value={`${monthHours}`} unit="hrs" accent="from-cyan-500 to-blue-600" />
            <Card title="Movies" value={monthMovies} unit="titles" accent="from-purple-500 to-pink-600" />
            <div className="col-span-2 md:col-span-1">
              <Card title="Series" value={monthSeries} unit="shows" accent="from-indigo-500 to-purple-600" />
            </div>
          </div>
        </section>

        {/* STREAKS */}
        <section>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300/90 px-1">STREAK ACHIEVEMENTS</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="group relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-slate-950/90 p-6 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]">
              <div className="absolute top-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-amber-500 to-orange-600 opacity-60 group-hover:opacity-100 transition-all" />
              <div className="flex justify-between items-center h-full">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-200/90 group-hover:text-white">Current Streak</p>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">{currentStreak}</h2>
                    <span className="text-xs font-bold text-slate-400">Days</span>
                  </div>
                </div>
                <div className="border-l border-slate-800 pl-8 py-2 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">All-Time Best</p>
                  <div className="mt-3 flex items-baseline justify-end gap-1.5">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-300">{highestStreak}</h2>
                    <span className="text-xs font-bold text-slate-500">Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YEAR SELECTOR */}
        <div className="flex justify-end">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none cursor-pointer hover:border-slate-500 transition-colors">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (<option key={year} value={year}>{year}</option>))}
          </select>
        </div>

        {/* HEATMAP */}
        <section className="space-y-3 pt-2">
          <div ref={scrollGraphRef} onWheel={handleGraphWheel} className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0d1117] to-[#090d16] p-6 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[1020px] flex flex-col relative">
              <div className="relative h-6 pl-9 w-full mb-2 select-none">
                {monthLabels.map((month, mIdx) => (<span key={mIdx} className="absolute text-[11px] font-bold text-slate-400/80 tracking-wide transition-colors hover:text-white" style={{ left: `${36 + month.weekIndex * 18}px` }}>{month.name}</span>))}
              </div>

              <div className="flex items-start">
                <div className="flex flex-col gap-[5px] pr-3 justify-start pt-[1.5px] text-right w-6 select-none shrink-0">
                  {weekDays.map((day) => (<span key={day} className="text-[10px] font-bold text-slate-500 h-[13px] leading-none flex items-center justify-end">{day}</span>))}
                </div>

                <div className="flex gap-[5px]">
                  {weeksArray.map((week, wIdx) => (<div key={wIdx} className="flex flex-col gap-[5px] w-[13px]">{week.map((day, dIdx) => {
                        const count = day.active || 0;
                        let colorClass = "bg-slate-800/40 hover:bg-slate-700";
                        if (count > 0 && count <= 2) colorClass = "bg-green-700/60 shadow-[0_0_6px_rgba(21,128,61,0.2)]";
                        else if (count > 2 && count <= 4) colorClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
                        else if (count > 4) colorClass = "bg-emerald-400 scale-105 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
                        return (<div key={dIdx} title={`${day.dateKey} : ${count} Activity registered`} className={`h-[13px] w-[13px] rounded-[2px] transition-all duration-200 cursor-pointer ${colorClass}`} />);
                      })}</div>))}
                </div>
              </div>

              <div className="flex justify-end items-center text-[11px] text-slate-500 font-medium pt-5 select-none w-full">
                <div className="flex items-center gap-1.5 pr-1">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-800/40" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-green-700/60" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-green-500" />
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
                  <span>More</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default Profile;