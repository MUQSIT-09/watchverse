const UpcomingReleases = () => {
  const releases = [
    {
      title: "The Boys S5",
      days: "3 Days",
    },
    {
      title: "Stranger Things S5",
      days: "7 Days",
    },
    {
      title: "Panchayat S4",
      days: "12 Days",
    },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
      <h2 className="text-xl font-bold mb-4">
        Upcoming Releases
      </h2>

      {releases.map((item) => (
        <div
          key={item.title}
          className="flex justify-between py-3 border-b border-slate-800"
        >
          <span>{item.title}</span>
          <span className="text-sky-400">
            {item.days}
          </span>
        </div>
      ))}
    </div>
  );
};

export default UpcomingReleases;