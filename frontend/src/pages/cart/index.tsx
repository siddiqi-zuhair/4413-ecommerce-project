import Link from "next/link";
import { useEffect, useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const calculateTotal = () => {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total += cart[i].price * cart[i].ordered_quantity;
    }
    return total;
  };

  const fetchProducts = async () => {
    // Retrieve the cart from localStorage
    const cart = localStorage.getItem("cart");

    // Check if cart exists and parse it
    if (cart) {
      const cartItems = JSON.parse(cart);
      const ids = cartItems.map((item: { id: string }) => item.id);

      // Fetch products based on IDs
      if (ids.length > 0) {
        try {
          // Replace with your actual endpoint
          const response = await fetch(
            `http://localhost:5000/products/multiple?ids=${ids.join(",")}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const products = await response.json();
          //set the cart with the ordered quantity of each product
          for (let i = 0; i < products.length; i++) {
            products[i].ordered_quantity = cartItems[i].quantity;
          }
          setCart(products);

          // Handle the fetched products as needed
          // For example, set them in state or update the UI
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      } else {
        console.log("No product IDs found in cart.");
      }
    } else {
      console.log("Cart is empty.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-112px)] bg-gray-100 text-gray-600">
      <h2 className="text-8xl font-black mb-6 text-left pt-5 pl-5">Cart</h2>
      <div className="p-8 w-full flex justify-center">
        <div className="flex flex-col w-2/3 mt-10">
          {cart.map((product: any) => (
            <div
              key={product._id}
              className="flex items-center justify-between border-gray-300 pb-4"
            >
              <div>
                <Link href={"/catalog/" + product._id}>
                  <h3 className="text-3xl font-semibold">{product.name}</h3>
                </Link>
                <p className="text-gray-500 text-xl">Price: ${product.price}</p>
                <p className="text-gray-500 text-xl">
                  Quantity: {product.ordered_quantity}
                </p>
              </div>
              <div>
                <img
                  src={
                    "https://images.igdb.com/igdb/image/upload/t_cover_big/" +
                    product.cover +
                    ".jpg"
                  }
                  alt={product.name}
                  className="w-32 h-auto object-cover "
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Total:</h3>
            <p className="text-xl font-semibold">
              ${calculateTotal().toFixed(2)}
            </p>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
