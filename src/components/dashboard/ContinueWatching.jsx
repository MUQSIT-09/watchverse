const ContinueWatching = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Continue Watching
      </h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:scale-105 transition">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
            alt=""
            className="w-full h-52 object-cover"
          />

          <div className="p-4">
            <h3 className="font-bold text-lg">
              The Boys
            </h3>

            <p className="text-slate-400">
              S04 E06
            </p>

            <div className="mt-3 bg-slate-700 h-2 rounded-full">
              <div className="bg-sky-500 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:scale-105 transition">
          <img
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c"
            alt=""
            className="w-full h-52 object-cover"
          />

          <div className="p-4">
            <h3 className="font-bold text-lg">
              Panchayat
            </h3>

            <p className="text-slate-400">
              S03 E05
            </p>

            <div className="mt-3 bg-slate-700 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:scale-105 transition">
          <img
            src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1"
            alt=""
            className="w-full h-52 object-cover"
          />

          <div className="p-4">
            <h3 className="font-bold text-lg">
              House of the Dragon
            </h3>

            <p className="text-slate-400">
              S02 E03
            </p>

            <div className="mt-3 bg-slate-700 h-2 rounded-full">
              <div className="bg-purple-500 h-2 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueWatching;