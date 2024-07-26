import { useEffect, useState } from "react";
import { Item } from "../../../interfaces/item";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Carousel from "@/components/ImageVideoCarousel";

interface photoVideo {
  type: "cover" | "photo" | "video";
  id: string;
}

export default function Product() {
  const [product, setProduct] = useState<Item>();
  const [videosAndPhotos, setVideosAndPhotos] = useState<photoVideo[]>([]);
  const router = useRouter();
  const param = router.query.productID;
  useEffect(() => {
    if (router.isReady && param) {
      console.log(param);
      fetchProduct();
    }
  }, [router.isReady, param]);

  const fetchProduct = async () => {
    console.log(param);
    const res = await fetch("http://localhost:5000/products/" + param);
    const data = await res.json();
    setProduct(data as Item);
    let tempVidPhoto: photoVideo[] = [];
    if (data.cover) {
      tempVidPhoto = [...tempVidPhoto, { type: "cover", id: data.cover }];
    }
    if (data.videos) {
      tempVidPhoto = [
        ...tempVidPhoto,
        ...data.videos.map((video: string) => ({ type: "video", id: video })),
      ];
    }

    if (data.photos) {
      tempVidPhoto = [
        ...tempVidPhoto,
        ...data.photos.map((photo: string) => ({ type: "photo", id: photo })),
      ];
    }
    setVideosAndPhotos(tempVidPhoto);
  };

  return product === undefined ? (
    <Loading />
  ) : (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full p-5 pt-20 h-full text-gray-600 gap-6 min-h-[calc(100vh-112px)]">
      <div className="w-full grid grid-flow-row grid-cols-2 gap-x-5 px-5 items-center">
        <div>
          {videosAndPhotos && videosAndPhotos.length > 0 && (
            <Carousel items={videosAndPhotos} />
          )}
        </div>
        <div className="grid gap-5">
          <div className="flex text-5xl font-black gap-3 pt-10 tracking-wider items-center justify-start ">
            <span className="border-r-2 border-gray-600 pr-2">
              {product.name}
            </span>{" "}
            <span className="text-xl pl-2 ">
              {product.platform.map(
                (p: string, index) =>
                  p + (index != product.platform.length - 1 ? " | " : "")
              )}
            </span>
          </div>
          <p className="text-5xl font-black">${product.price}</p>
          <p className="w-fit border p-2 rounded-xl bg-red-500 text-white font-bold">
            {product.quantity} in stock
          </p>

          <button className="bg-red-500 hover:bg-gray-500 font-black text-white p-2 text-3xl rounded-xl">
            Add to cart
          </button>
          <p className="text-3xl font-black pt-5">Description</p>
          <p className="text-xl">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
