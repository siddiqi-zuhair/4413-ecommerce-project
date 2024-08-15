import { get } from "http";
import { useState, useEffect, useRef } from "react";

interface CarouselProps {
  items: Array<{ type: string; url: string }>;
}
const Carousel = ({ items }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const getThumbnail = (url: string) => {
    let videoId = url.split("v=")[1];
    if (!videoId) videoId = url.split("embed/")[1];
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  };
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const newIndex = Math.round(element.scrollLeft / element.clientWidth);
    setCurrentIndex(newIndex);
  };

  const scrollToIndex = (index: number) => {
    const element = carouselRef.current;
    if (element) {
      element.scrollTo({
        left: index * element.clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      <div
        className="relative w-full overflow-hidden flex snap-x snap-mandatory overflow-x-hidden scroll-smooth"
        onScroll={handleScroll}
        ref={carouselRef}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="snap-start flex-shrink-0 w-full flex justify-center items-center"
          >
            {item.type === "photo" ? (
              <img
                className="rounded-xl object-cover "
                src={item.url}
                alt="Carousel Item"
              />
            ) : item.type === "cover" ? (
              <img
                className="rounded-2xl object-cover scale-125"
                src={item.url}
                alt="Carousel Item"
              />
            ) : (
              <iframe
                width="560"
                height="315"
                src={item.url}
                title="Carousel Item"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-4 space-x-2 w-full overflow-x-scroll ">
        {items.map((item, index) => (
          <button
            key={index}
            className={`w-28 h-fit flex-shrink-0 ${
              index === currentIndex
                ? "border-2 border-blue-500"
                : "border-2 border-transparent"
            }`}
            onClick={() => scrollToIndex(index)}
          >
            {item.type === "photo" ? (
              <img
                className="w-full h-full object-cover rounded"
                src={item.url}
                alt="Preview Item"
              />
            ) : item.type === "cover" ? (
              <img
                className="w-full h-full object-cover rounded"
                src={item.url}
                alt="Preview Item"
              />
            ) : (
              <div className="w-full h-full flex items-center relative justify-center rounded">
                <img
                  className="w-[40px] h-[40px] z-10 absolute"
                  src="/images/play-button.svg"
                  alt="Youtube Logo"
                />
                <img
                  className="w-full h-full object-cover rounded"
                  src={getThumbnail(item.url)}
                ></img>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
