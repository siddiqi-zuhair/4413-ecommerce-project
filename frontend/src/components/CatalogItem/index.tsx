import Link from "next/link";
import { Item } from "../../interfaces/item";

export default function CatalogItem({ item }: { item: Item }) {
  return (
    <Link href={`/catalog/${item.id}`} passHref>
      <div className="bg-white m-4 p-4 rounded-xl shadow-lg items-start block">
        <h2 className="text-2xl font-bold">{item.name}</h2>
        <p className="text-lg">{item.description}</p>
        <p className="text-lg">{item.platform}</p>
        <p className="text-lg">${item.price}</p>
        <p className="text-lg">{item.quantity}</p>
        <div className="aspect-square w-full h-full">
           <img className="rounded-xl" src={item.image} alt={item.name} />
        </div>
      </div>
    </Link>
  );
}
