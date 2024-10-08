import { useState, useEffect } from "react";
import Link from "next/link";

interface PopularItem {
  _id: string;
  photos: string[];
  cover: string;
  name: string;
  price: number;
  platform: string[];
  quantity: number;
  total_ordered_quantity: number;
}

interface ItemCarouselProps {
  items: PopularItem[];
}

const ItemCarousel: React.FC<ItemCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // State to track the current index of the carousel

  useEffect(() => {
    // Set up an interval to automatically advance the carousel every 5 seconds
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length; // Calculate the next index, wrapping around to 0 if necessary
        scrollTo(nextIndex); // Scroll to the next item
        return nextIndex; // Update the state with the new index
      });
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup the interval when the component unmounts
  }, [items]); // Re-run this effect if the items array changes

  // Function to scroll the carousel to a specific index
  const scrollTo = (index: number) => {
    const container = document.querySelector(".snap-x"); // Select the container with the class "snap-x"
    if (container) {
      const elements = container.querySelectorAll(".snap-center"); // Select all elements with the class "snap-center" inside the container
      const target = elements[index] as HTMLElement; // Get the target element at the specified index
      if (target) {
        container.scrollTo({
          left: target.offsetLeft, // Scroll to the target element's position
          behavior: "smooth", // Smooth scrolling effect
        });
      }
    }
    setCurrentIndex(index); // Update the current index state
  };

  return (
    <div className="relative">
      <div className="w-full h-full overflow-hidden snap-x snap-mandatory">
        <div className="flex flex-row">
          {items.map((item, index) => (
            <Link href={`/catalog/${item._id}`} key={index}>
              <div
                className="relative w-screen h-[75vh] flex-none items-center justify-center text-white text-4xl overflow-hidden bg-cover bg-center snap-center"
                style={{ backgroundImage: `url(${item.photos[0]})` }}
              >
                <div className="absolute inset-0 backdrop-filter backdrop-brightness-50 backdrop-blur-2xl"></div>
                <div className="flex flex-col text-left ml-20 pb-8 w-full h-full">
                  <div className="flex flex-col w-full gap-5 h-full items-start justify-end">
                    <div className="relative z-10 text-5xl w-1/3 rounded-2xl">
                      <img src={item.cover} alt={item.name} className="w-1/2 rounded-2xl" />
                    </div>
                    <div className="relative z-10 text-5xl">
                      {item.name} <br />
                      <span className="text-3xl font-light">${item.price}</span> <br />
                      <span className="text-3xl font-light">
                        Platforms: {item.platform.join(" | ")} <br />
                        {item.quantity} in stock <br />
                        {item.total_ordered_quantity} sold recently
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scrollTo((currentIndex - 1 + items.length) % items.length)}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center p-4 text-3xl text-white bg-gray-800 rounded-full shadow-lg hover:bg-gray-700"
        style={{ zIndex: 20 }}
      >
        {"←"}
      </button>
      <button
        onClick={() => scrollTo((currentIndex + 1) % items.length)}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center p-4 text-3xl text-white bg-gray-800 rounded-full shadow-lg hover:bg-gray-700"
        style={{ zIndex: 20 }}
      >
        {"→"}
      </button>

      {/* Bottom navigation buttons */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-gray-800" : "bg-gray-400"
            } transition-colors`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ItemCarousel;
