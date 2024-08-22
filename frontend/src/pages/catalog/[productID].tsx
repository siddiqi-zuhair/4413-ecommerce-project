import { useEffect, useState } from "react";
import { Item } from "../../interfaces/item";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Carousel from "@/components/ImageVideoCarousel";
import { useAuth } from "@/context/authContext";
import toast from "react-hot-toast";
interface photoVideo {
  type: "cover" | "photo" | "video";
  url: string;
}

export default function Product() {
  const [product, setProduct] = useState<Item | null>(null);
  const [videosAndPhotos, setVideosAndPhotos] = useState<photoVideo[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const param = router.query.productID;
  const { isAuthenticated, user, logout } = useAuth();

  const handleAddToCart = () => {
    addToCart();
    toast.success("Added to cart");
  };
  useEffect(() => {
    if (router.isReady && param) {
      fetchProduct();
    }
  }, [router.isReady, param]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/` + param
      );

      if (!res.ok) {
        throw new Error("Product not found");
      }

      const data = await res.json();
      setProduct(data as Item);
      let tempVidPhoto: photoVideo[] = [];

      if (data.cover) {
        tempVidPhoto = [...tempVidPhoto, { type: "cover", url: data.cover }];
      }
      if (data.videos) {
        tempVidPhoto = [
          ...tempVidPhoto,
          ...data.videos.map((video: string) => ({
            type: "video",
            url: video,
          })),
        ];
      }

      if (data.photos) {
        tempVidPhoto = [
          ...tempVidPhoto,
          ...data.photos.map((photo: string) => ({
            type: "photo",
            url: photo,
          })),
        ];
      }
      setVideosAndPhotos(tempVidPhoto);
    } catch (error) {
      console.error(error);
      // Redirect to catalog or display error message
      toast.error("Product not found");
      router.push("/catalog");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    if (!user) {
      let cart = localStorage.getItem("cart");
      let updatedCart = [];

      if (product) {
        if (cart) {
          updatedCart = JSON.parse(cart);
          let itemExists = false;

          // Check if the item is already in the cart and update the quantity
          for (let i = 0; i < updatedCart.length; i++) {
            if (updatedCart[i].id === product._id) {
              if (
                updatedCart[i].ordered_quantity + quantity >
                product.quantity
              ) {
                toast.error("Not enough stock");
                return;
              }
              updatedCart[i].ordered_quantity += quantity;
              itemExists = true;
              break;
            }
          }

          // If the item is not in the cart, add it
          if (!itemExists) {
            updatedCart.push({ id: product._id, ordered_quantity: quantity });
          }
        } else {
          updatedCart = [{ id: product._id, ordered_quantity: quantity }];
        }

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        const event = new Event("cartChange");
        window.dispatchEvent(event);
      } else {
        console.error("Product is not defined");
      }
    } else {
      // User is logged in
      try {
        // Fetch the user's cart from localhost:5000
        let response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/carts/${user._id}`
        );
        let cart = await response.json();
        if (!response.ok) {
          // If the cart doesn't exist, create a new one
          cart = {
            user_id: user._id,
            products: [{ id: product._id, ordered_quantity: quantity }],
            totalPrice: product.price * quantity,
            dateOrdered: new Date(),
          };
          response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/carts`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cart),
            }
          );
        } else {
          // Cart exists, update it
          let itemExists = false;

          for (let i = 0; i < cart.products.length; i++) {
            if (cart.products[i].id === product._id) {
              if (
                cart.products[i].ordered_quantity + quantity >
                product.quantity
              ) {
                toast.error("Not enough stock");
                return;
              }
              cart.products[i].ordered_quantity += quantity;
              itemExists = true;
              break;
            }
          }

          // If the item is not in the cart, add it
          if (!itemExists) {
            cart.products.push({ id: product._id, ordered_quantity: quantity });
          }

          cart.totalPrice += product.price * quantity;

          response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/carts/${user._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cart),
            }
          );
        }

        if (response.ok) {
          const event = new Event("cartChange");
          window.dispatchEvent(event);
        } else {
          console.error("Failed to update the cart");
        }
      } catch (error) {
        console.error("An error occurred while adding to the cart", error);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return product === null ? (
    <div>Error: Product not found</div>
  ) : (
    <div className="bg-stone-50 flex flex-col items-start justify-start w-full p-5 pt-20 h-full text-gray-600 gap-6 min-h-[calc(100vh-144px)]">
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
          <p className="text-3xl font-black border-2 border-gray-500 w-fit rounded-2xl p-2">
            Quantity:{" "}
            <input
              type="number"
              defaultValue="1"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              max={product.quantity}
              className=" bg-transparent p-2 rounded-xl w-fit"
            />
          </p>

          <button
            onClick={handleAddToCart}
            className="bg-red-500 hover:bg-gray-500 font-black text-white p-2 text-3xl rounded-xl disabled:bg-red-800 disabled:brightness-75 disabled:cursor-not-allowed"
            disabled={quantity > product.quantity}
          >
            Add to cart
          </button>
          <p className="text-3xl font-black pt-5">Description</p>
          <p className="text-xl">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
