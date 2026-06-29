import { useRef, useEffect } from "react";

const SliderRow = ({ title, children }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        slider.scrollLeft += event.deltaY;
      }
    };

    slider.addEventListener("wheel", handleWheel, { passive: false });
    return () => slider.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>

      <div
        ref={sliderRef}
        className="
          slider-scroll
          flex
          gap-4 md:gap-5
          overflow-x-auto
          pb-3
          scroll-smooth
          items-start
          "
      >
        {children}
      </div>
    </section>
  );
};

export default SliderRow;
