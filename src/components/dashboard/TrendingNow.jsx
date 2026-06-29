const TrendingNow = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Trending Now
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-slate-900 h-72 rounded-3xl border border-slate-800 hover:scale-105 transition"
          >
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingNow;