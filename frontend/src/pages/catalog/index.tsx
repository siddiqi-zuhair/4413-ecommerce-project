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
    let data = await res.json();
    // Remove items that have a quantity of 0 directly from the data array
    data = data.filter((item: Item) => item.quantity > 0);
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
  const filterByKeyword = (e: any) => {
    const keyword = e.target.value;
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
    console.log(filteredItems);
    setFilteredItems(filteredItems);
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

  return items.length < 1 ? (
    <Loading />
  ) : (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full h-full min-h-[calc(100vh-144px)] text-gray-600 ">
      <h1 className="text-8xl font-black tracking-wider p-10">Catalog</h1>
      <div className="flex flex-row justify-between w-full">
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
        <div>
          <input
            type="text"
            placeholder="Search"
            className="w-3/4 p-2 bg-slate-50 outline-black outline outline-1 rounded-2xl"
            onChange={filterByKeyword}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center pt-10">
        {filteredItems &&
          filteredItems.map((item) => (
            <CatalogItem key={item._id} item={item} />
          ))}
        {filteredItems.length < 1 && (
          <div className="flex items-center text-6xl p-10 font-bold w-full h-full">
            No items with those filter options{" "}
          </div>
        )}
      </div>
    </div>
  );
}
