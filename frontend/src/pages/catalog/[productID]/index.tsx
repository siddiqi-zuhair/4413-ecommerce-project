import { useEffect, useState } from "react";
import { Item } from "../../../interfaces/item";
import { useRouter } from "next/router";

export default function Product() {
  const [product, setProduct] = useState<Item>();
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
  };

  return product === undefined ? (
    <div>Product not found</div>
  ) : (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full p-20 h-full text-gray-600  min-h-screen">
      <div className="flex text-5xl font-black tracking-wider items-center justify-center ">
        <span className="border-r-2 border-gray-600 pr-2">{product.name}</span>{" "}
        <span className="text-2xl pl-2"> {product.platform}</span>{" "}
      </div>
      <p className="text-4xl">{product.description}</p>
      <p className="text-4xl">${product.price}</p>
      <p className="text-4xl">{product.quantity}</p>
    {product.photos && product.photos.map((image) => (
        <div className="">
          <img className="rounded-xl" src={"https://images.igdb.com/igdb/image/upload/t_screenshot_med/"+image + ".jpg"} alt={product.name} />
        </div>
    ))}
      <iframe
        width="560"
        height="315"
        src={"https://youtube.com/embed/" + product.videos[0]}
      ></iframe>
    </div>
  );
}
