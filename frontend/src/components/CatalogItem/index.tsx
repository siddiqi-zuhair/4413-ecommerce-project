import Link from "next/link";
import { Item } from "../../interfaces/item";

export default function CatalogItem({ item }: { item: Item }) {
  return (
    <Link href={`/catalog/${item._id}`} passHref>
      <div className="bg-white m-4 p-4 rounded-xl shadow-lg items-start block w-[400px] h-[600px] overflow-hidden hover:scale-110 hover:transition-all transition-all">
        <h2 className="text-xl font-bold">{item.name}</h2>
        <p className="overflow-ellipsis overflow-hidden whitespace-nowrap text-lg font-normal">{item.platform.map((p: string, index) => p + (index != item.platform.length-1 ? " | " : ''))}</p>
        <p className="text-lg">${item.price}</p>
          <img
            className="rounded-xl w-full p-2"
            src={
              item.cover
            }
            alt={item.name}
          />

      </div>
    </Link>
  );
}
