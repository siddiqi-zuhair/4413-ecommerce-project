import Link from "next/link";
import { Item } from "../../interfaces/item";
import CatalogItem from "@/components/CatalogItem";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Dropdown from "@/components/Dropdown";

export default function Catalog() {
  const sortOptions = ["Price", "Name"];
  const [filterOptions, setFilterOptions] = useState<string[]>(["All"]);
  const [chosenSort, setChosenSort] = useState<string>("");
  const [chosenFilter, setChosenFilter] = useState<string>("");
  useEffect(() => {
    fetchItems();
  }, []);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const fetchItems = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setItems(data as Item[]);
    setFilteredItems(data as Item[]);
    for (const item of data) {
      let temp = filterOptions;
      for (const platform of item.platform) {
        if (!temp.includes(platform)) {
          temp.push(platform);
        }
      }
      setFilterOptions(temp);
    }
  };
  useEffect(() => {
    if (chosenSort === "Price") {
      setFilteredItems((prev) => [...prev].sort((a, b) => a.price - b.price));
    } else {
      setFilteredItems((prev) =>
        [...prev].sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [chosenSort]);

  useEffect(() => {
    if (chosenFilter === "All") {
      setFilteredItems(items);
    } else {
      const filteredItems = items.filter((item) =>
        item.platform.includes(chosenFilter)
      );
      setFilteredItems(filteredItems);
      setChosenSort("");
    }
  }, [chosenFilter]);

  return filteredItems.length === 0 ? (
    <Loading />
  ) : (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full h-full text-gray-600 ">
      <h1 className="text-8xl font-black tracking-wider p-10">Catalog</h1>
      <div className="flex items-center justify-center text-3xl font-extrabold text-gray-500 px-10 gap-5">
        <Dropdown
          label="Sort by"
          options={sortOptions}
          setChosenSort={setChosenSort}
        />
        <Dropdown
          label="Filter by platform"
          options={filterOptions}
          setChosenSort={setChosenFilter}
        />
      </div>

      <div className="flex flex-wrap justify-center pt-10">
        {filteredItems.map((item) => (
          <CatalogItem key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
