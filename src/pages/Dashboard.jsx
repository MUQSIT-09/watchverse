import React, { useEffect, useRef, useState } from "react";
import { getUserLibrary } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import HeroSection from "../components/dashboard/HeroSection";
import SearchBar from "../components/dashboard/SearchBar";
import MonthlyProgress from "../components/dashboard/MonthlyProgress";
import useDashboard from "../hooks/useDashboard";
import TrendingSlider from "../components/dashboard/TrendingSlider";
import TopSeriesSlider from "../components/dashboard/TopSeriesSlider";
import TopMovieSlider from "../components/dashboard/TopMovieSlider";
import UpcomingSlider from "../components/dashboard/UpcomingSlider";
import ContinueWatchingSlider from "../components/dashboard/ContinueWatchingSlider";
import PlanSlider from "../components/dashboard/PlanSlider";
import OnHoldSlider from "../components/dashboard/OnHoldSlider";
import RecentlyReleasedSlider from "../components/dashboard/RecentlyReleasedSlider";
import SliderSkeleton from "../components/dashboard/SliderSkeleton";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const {
    trending,
    movies,
    series,
    upcoming,
    recentlyReleased,
    loading,
  } = useDashboard();

  const { user } = useAuth();

  const [library, setLibrary] = useState([]);

 useEffect(() => {
  const load = async () => {
    if (!user) {
      setLibrary([]);
      return;
    }

    try {
      const data = await getUserLibrary(user.uid);

      const safe =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.library)
          ? data.library
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setLibrary(safe);
    } catch (err) {
      console.log(err);
      setLibrary([]);
    }
  };

  load();
}, [user]);

  const safeLibrary = Array.isArray(library) ? library : [];

const continueWatching = safeLibrary.filter(
  (show) =>
    show.status === "watching" ||
    show.status === "rewatch"
);

const planned = safeLibrary.filter(
  (show) => show.status === "plan"
);

const onHold = safeLibrary.filter(
  (show) => show.status === "on_hold"
);
  const isLoggedIn = !!user;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-1 sm:px-4 space-y-12 md:space-y-16 pb-16">

        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
          <HeroSection />
          <div className="relative z-10 -mt-4 sm:-mt-6">
            <SearchBar />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900/60">
          <MonthlyProgress />
        </div>

        {isLoggedIn && (
          <div className="space-y-12 md:space-y-16 border-t border-slate-900/60 pt-8 sm:pt-12">
            {continueWatching.length > 0 && (
              <ContinueWatchingSlider shows={continueWatching} />
            )}

            {planned.length > 0 && (
              <PlanSlider shows={planned} />
            )}

            {onHold.length > 0 && (
              <OnHoldSlider shows={onHold} />
            )}
          </div>
        )}

        <div className="space-y-12 md:space-y-16 border-t border-slate-900/60 pt-8 sm:pt-12">
          {loading ? (
            <div className="space-y-12 opacity-40">
              <SliderSkeleton />
              <SliderSkeleton />
              <SliderSkeleton />
              <SliderSkeleton />
              <SliderSkeleton />
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16 animate-fadeIn">
              <TrendingSlider shows={trending} />
              <TopSeriesSlider shows={series} />
              <TopMovieSlider shows={movies} />
              <RecentlyReleasedSlider shows={recentlyReleased} />
              <UpcomingSlider shows={upcoming} />
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;

