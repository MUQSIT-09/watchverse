import { watchlist } from "../../data/dummyData";

const WatchlistPreview = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-4">
        Watchlist
      </h2>

      <div className="space-y-3">
        {watchlist.map((item) => (
          <div
            key={item.title}
            className="bg-slate-800 rounded-xl p-4"
          >
            <h3>{item.title}</h3>

            <p className="text-slate-400">
              {item.year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPreview;