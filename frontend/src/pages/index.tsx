import { useState, useEffect } from "react";
import ItemCarousel from "../components/ItemCarousel";
import Catalog from "./catalog";

export default function Home() {
  const [popularItems, setPopularItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("http://localhost:5000/orders/popular/");
      const data = await res.json();
      setPopularItems(data);
    };

    fetchItems();
  }, []);

  return (
    <div className="bg-gray-200 min-h-[calc(100vh-144px)] text-3xl font-bold text-gray-600 relative">
      {popularItems.length > 0 && <ItemCarousel items={popularItems} />}
      <Catalog />
    </div>
  );
}
