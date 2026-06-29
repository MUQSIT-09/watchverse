import ShowCard from "./ShowCard";
import { Fragment } from "react";
const ShowGrid = ({ shows, view, selectedId, renderDetails, onSelect, highlightShow }) => {
  // Premium Empty State - Looks elegant on both mobile and desktop
  if (!shows?.length) {
    return (
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/50 to-slate-950/50 p-8 sm:p-12 text-center backdrop-blur-sm">
        <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-800/10 to-transparent" />
        <p className="relative z-10 text-xs sm:text-sm font-medium tracking-wide text-slate-400">
          No Shows in this section yet.
        </p>
      </div>
    );
  }

  return (
    // Responsive grid padding and gaps optimized for all device sizes
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {shows.map((show) => {
        const isSelected = show.id === selectedId;

        return (
          <div 
            key={show.tmdbId}
            // Smooth, premium scale transition on interaction
            className={`transition-all duration-300 ease-out ${
              isSelected ? "scale-[1.01]" : "hover:scale-[1.01]"
            }`}
          >
            <ShowCard
            show={show}
              highlight={highlightShow === show.tmdbId}
              view={view}
              isSelected={isSelected}
              onSelect={onSelect}
            />

            {/* Inline Details - Scaled perfectly for mobile screens through ultra-wides */}
            {isSelected && (
              <div className="mt-3 sm:mt-4 block transform animate-fadeIn border-t border-slate-800/40 pt-3 sm:pt-4 2xl:hidden">
                <div className="rounded-xl sm:rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 backdrop-blur-md shadow-2xl">
                  {renderDetails}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShowGrid;