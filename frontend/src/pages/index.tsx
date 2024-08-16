import CatalogItem from "@/components/CatalogItem";
import { useState, useEffect } from "react";
export default function Home() {
  const [popularItems, setPopularItems] = useState<any>([]);
  useEffect(() => {
    getPopularItems().then((data) => {
      setPopularItems(data);
    });
  }, []);
  const getPopularItems = async () => {
    const res = await fetch("http://localhost:5000/orders/popular/");
    const data = await res.json();
    console.log(data);
    return data;
  };
  return (
    <div className="bg-gray-200 min-h-[calc(100vh-144px)] text-3xl font-bold text-gray-600 p-5">
      <h1 className="text-5xl">Welcome to JZ Game Store</h1>

      <p className="mt-10 text-4xl">Popular Items: </p>
      <div className="grid grid-cols-4 gap-5 mt-5">
        {popularItems.map((item: any) => (
          <CatalogItem key={item} item={item} />
        ))}
      </div>
    </div>
  );
}
