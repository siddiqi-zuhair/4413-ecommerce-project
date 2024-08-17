import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import router from "next/router";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();
  const [cartID, setCartID] = useState<string | null>(null);

  const calculateTotal = () => {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total += cart[i].price * cart[i].ordered_quantity;
    }
    return total;
  };

  const goToCheckout = () => {
    if (!user) {
      router.push("/signin?redirect=cart");
      return;
    } else {
      router.push(`/checkout/${cartID}`);
    }
  };

  const removeProduct = async (e: any) => {
    const updatedCart = cart.filter((product) => product._id !== e.target.id);
    setCart(updatedCart);

    // Optimistically update localStorage or dispatch changes to the backend
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      await fetch(`http://localhost:5000/carts/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: updatedCart }),
      });
    }

    // Dispatch cartChange event
    window.dispatchEvent(new Event("cartChange"));
  };

  const changeQuantity = async (e: any) => {
    const updatedCart = cart.map((product) => {
      if (product._id === e.target.id) {
        if (Number(e.target.value) > product.quantity) {
          toast.error("Not enough stock");
          return product;
        } else if (Number(e.target.value) < 1) {
          toast.error("Quantity must be at least 1");
          return product;
        }
        return {
          ...product,
          ordered_quantity: Number(e.target.value),
        };
      }
      return product;
    });
    setCart(updatedCart);

    // Optimistically update localStorage or dispatch changes to the backend
    if (!user) {
      // only put the _id and the ordered_quantity in localStorage
      console.log(updatedCart);
      const cartItems = updatedCart.map((item) => ({
        id: item._id,
        ordered_quantity: item.ordered_quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } else {
      await fetch(`http://localhost:5000/carts/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: updatedCart }),
      });
    }

    // Dispatch cartChange event
    window.dispatchEvent(new Event("cartChange"));
  };

  const fetchProducts = async () => {
    let productsWithQuantity = [];

    // Check if the user is logged in
    if (!user) {
      // Fetch cart from localStorage
      const localStorageCart = localStorage.getItem("cart");
      if (localStorageCart) {
        const cartItems = JSON.parse(localStorageCart);
        const ids = cartItems.map((item: any) => item.id);
        try {
          const response = await fetch(
            `http://localhost:5000/products/multiple?ids=${ids.join(",")}`
          );
          const data = await response.json();
          productsWithQuantity = data.map((product: any) => {
            const cartItem = cartItems.find(
              (item: any) => item.id === product._id
            );
            return {
              ...product,
              ordered_quantity: cartItem.ordered_quantity || 1,
            };
          });
        } catch (error) {
          console.error("Error fetching products from server:", error);
          return;
        }
      }
    } else {
      // Fetch cart with products directly from the server
      try {
        const response = await fetch(
          `http://localhost:5000/carts/user/${user._id}`
        );
        const data = await response.json();
        if (data && data.products) {
          productsWithQuantity = data.products;
          setCartID(data._id);
        }
      } catch (error) {
        console.error("Error fetching cart from server:", error);
        return;
      }
    }

    setCart(productsWithQuantity);
  };

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") {
      return; // wait until the authentication state is known
    }
    fetchProducts();

    // Add event listener for cart changes
    const handleCartChange = () => fetchProducts();
    window.addEventListener("cartChange", handleCartChange);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("cartChange", handleCartChange);
    };
  }, [isAuthenticated]);

  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-144px)] bg-gray-100 text-gray-600">
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
                  Quantity:{" "}
                  <input
                    className="bg-gray-100 rounded-lg w-fit p-2"
                    type="number"
                    min={1}
                    max={product.quantity}
                    onChange={changeQuantity}
                    id={product._id}
                    value={product.ordered_quantity}
                  />
                </p>
                <button
                  id={product._id}
                  onClick={removeProduct}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
              <div>
                <img
                  src={product.cover}
                  alt={product.name}
                  className="w-32 h-auto object-cover"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Total:</h3>
            <p className="text-xl font-semibold">
              ${calculateTotal().toFixed(2)}
            </p>
            <button
              disabled={cart.length === 0}
              onClick={goToCheckout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:contrast-50 disabled:hover:cursor-not-allowed"
            >
              {user ? "Checkout" : "Sign in to checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
