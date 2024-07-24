import Link from "next/link";
import { Item } from "../../interfaces/item";
import CatalogItem from "@/components/CatalogItem";
export default function catalog() {
  const items: Item[] = [
    {
      id: 1,
      name: "Mario",
      price: 60,
      quantity: 10,
      description: "Mario is a platform game",
      platform: "Nintendo",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp",
      video: "https://www.youtube.com/embed/5kcdRBHM7kM"
    },
    {
      id: 2,
      name: "Zelda",
      price: 70,
      quantity: 8,
      description: "The Legend of Zelda adventure game",
      platform: "Nintendo",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2kxd.webp",
      video: "https://www.youtube.com/embed/1tZbWy1S2Qw"
    },
    {
      id: 3,
      name: "Halo",
      price: 65,
      quantity: 12,
      description: "Halo is a sci-fi shooter game",
      platform: "Xbox",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3i1d.webp",
      video: "https://www.youtube.com/embed/9b6J6Jtw7R8"
    },
    {
      id: 4,
      name: "God of War",
      price: 75,
      quantity: 5,
      description: "Action-adventure game set in Norse mythology",
      platform: "PlayStation",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4lh3.webp",
      video: "https://www.youtube.com/embed/6w6W8cDJ0OY"
    },
    {
      id: 5,
      name: "Minecraft",
      price: 30,
      quantity: 20,
      description: "Sandbox game with endless possibilities",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5q2d.webp",
      video: "https://www.youtube.com/embed/HeX-mr-5U2s"
    },
    {
      id: 6,
      name: "Fortnite",
      price: 0,
      quantity: 15,
      description: "Battle royale game with building mechanics",
      platform: "Various",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6hlj.webp",
      video: "https://www.youtube.com/embed/2g8B1zi5ReU"
    },
    {
      id: 7,
      name: "Red Dead Redemption 2",
      price: 80,
      quantity: 7,
      description: "Open-world western adventure game",
      platform: "PlayStation",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7oe3.webp",
      video: "https://www.youtube.com/embed/2d5cn8D59FA"
    },
    {
      id: 8,
      name: "The Witcher 3",
      price: 65,
      quantity: 6,
      description: "Fantasy RPG with rich storytelling",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8npl.webp",
      video: "https://www.youtube.com/embed/6dMEdO4dH78"
    },
    {
      id: 9,
      name: "Overwatch",
      price: 40,
      quantity: 10,
      description: "Team-based shooter with diverse heroes",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co9xk4.webp",
      video: "https://www.youtube.com/embed/2dbpS5IoUSo"
    },
    {
      id: 10,
      name: "Assassin's Creed Valhalla",
      price: 70,
      quantity: 9,
      description: "Viking-themed action RPG",
      platform: "Xbox",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co10xd.webp",
      video: "https://www.youtube.com/embed/XNc7tmwxGmA"
    },
    {
      id: 11,
      name: "Cyberpunk 2077",
      price: 60,
      quantity: 8,
      description: "Open-world RPG set in a dystopian future",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co11ys.webp",
      video: "https://www.youtube.com/embed/8IgtM7GJ0n4"
    },
    {
      id: 12,
      name: "Super Smash Bros Ultimate",
      price: 65,
      quantity: 11,
      description: "Fighting game with a massive roster of characters",
      platform: "Nintendo",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co12ji.webp",
      video: "https://www.youtube.com/embed/PltL9tLpLoI"
    },
    {
      id: 13,
      name: "Apex Legends",
      price: 0,
      quantity: 14,
      description: "Battle royale game with unique characters",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co13ef.webp",
      video: "https://www.youtube.com/embed/sDAtKxo1P8Q"
    },
    {
      id: 14,
      name: "Hades",
      price: 25,
      quantity: 13,
      description: "Roguelike dungeon crawler with Greek mythology themes",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co14rz.webp",
      video: "https://www.youtube.com/embed/k6hW9wHl0hU"
    },
    {
      id: 15,
      name: "Bloodborne",
      price: 55,
      quantity: 7,
      description: "Dark action RPG with a gothic horror theme",
      platform: "PlayStation",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co15rt.webp",
      video: "https://www.youtube.com/embed/7L8rkccISmU"
    },
    {
      id: 16,
      name: "Persona 5",
      price: 45,
      quantity: 6,
      description: "Japanese RPG with social simulation elements",
      platform: "PlayStation",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co16u8.webp",
      video: "https://www.youtube.com/embed/c2PTu7xkZ8E"
    },
    {
      id: 17,
      name: "Stardew Valley",
      price: 20,
      quantity: 18,
      description: "Farming simulation game with RPG elements",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co17sn.webp",
      video: "https://www.youtube.com/embed/8zy-bz3nB4Y"
    },
    {
      id: 18,
      name: "Rocket League",
      price: 30,
      quantity: 17,
      description: "Soccer with rocket-powered cars",
      platform: "Various",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co18sb.webp",
      video: "https://www.youtube.com/embed/aB7u7ciZj6g"
    },
    {
      id: 19,
      name: "Dark Souls III",
      price: 60,
      quantity: 12,
      description: "Challenging action RPG with a dark fantasy setting",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co19d8.webp",
      video: "https://www.youtube.com/embed/9F3S0pRCf0k"
    },
    {
      id: 20,
      name: "Fall Guys",
      price: 20,
      quantity: 16,
      description: "Battle royale game with colorful mini-games",
      platform: "PC",
      image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co20nl.webp",
      video: "https://www.youtube.com/embed/2lFV8o7q6Sw"
    }
  ];

  return (
    <div className="bg-stone-50 flex flex-col items-center justify-start w-full h-full text-gray-600 ">
      <h1 className="text-8xl font-black tracking-wider">Catalog</h1>
      <div className="flex flex-wrap justify-center pt-20">
        {items.map((item) => (
          <CatalogItem key={item.id} item={item} />
        ))}
        </div>
      </div>
  );
}
