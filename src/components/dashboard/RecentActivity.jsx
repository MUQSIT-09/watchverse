import { recentActivity } from "../../data/dummyData";

const RecentActivity = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-4">
        Recent Activity
      </h2>

      <div className="space-y-3">
        {recentActivity.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-4"
          >
            <h3>{item.title}</h3>

            <p className="text-slate-400">
              {item.episode}
            </p>

            <p className="text-sky-400">
              Rating: {item.rating}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;