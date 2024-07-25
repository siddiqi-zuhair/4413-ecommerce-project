import Link from "next/link";
import { Item } from "../../interfaces/item";
import CatalogItem from "@/components/CatalogItem";
import { useEffect, useState } from "react";
export default function catalog() {
  
  useEffect(() => {
    fetchItems();
  }, []);
  const [items, setItems] = useState<Item[]>([]);
  const fetchItems = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setItems(data as Item[]);
  }

  return (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full h-full text-gray-600 ">
      <h1 className="text-8xl font-black tracking-wider p-10">Catalog</h1>
      <div className="flex flex-wrap justify-center pt-10">
        {items.map((item) => (
          <CatalogItem key={item._id} item={item} />
        ))}
        </div>
      </div>
  );
}
