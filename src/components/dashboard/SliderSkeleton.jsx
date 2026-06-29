const SliderSkeleton = () => {

  return (

    <div className="space-y-4">

      <div
        className="
        h-8
        w-56
        rounded-lg
        bg-slate-800
        animate-pulse
        "
      />

      <div className="flex gap-4 overflow-hidden">

        {[1,2,3,4,5,6].map((item)=>(

          <div
            key={item}
            className="
            min-w-[220px]
            h-[330px]
            rounded-2xl
            bg-slate-800
            animate-pulse
            "
          />

        ))}

      </div>

    </div>

  );

};

export default SliderSkeleton;