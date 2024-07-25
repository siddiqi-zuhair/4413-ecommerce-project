import { Item } from "../../../interfaces/item";

export default function Product() {
  const mario: Item = {
    id: 1,
    name: "Super Mario Odyssey",
    price: 60,
    quantity: 10,
    description: "Mario is a platform game",
    platform: "Nintendo Switch",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp",
    video: "https://www.youtube.com/embed/5kcdRBHM7kM",
  };

  return (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full p-20 h-full text-gray-600  min-h-screen">
      <div className="flex text-5xl font-black tracking-wider items-center justify-center ">
        <span className="border-r-2 border-gray-600 pr-2">{mario.name}</span> <span className="text-2xl pl-2"> {mario.platform}</span>{" "}
      </div>
      <p className="text-4xl">{mario.description}</p>
      <p className="text-4xl">${mario.price}</p>
      <p className="text-4xl">{mario.quantity}</p>
      <div className="aspect-square">
        <img className="rounded-xl" src={mario.image} alt={mario.name} />
      </div>
      <iframe width="560" height="315" src={mario.video}></iframe>
    </div>
  );
}
