import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

export default function Header() {
  const [quantity, setQuantity] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();

  const getQuantity = () => {
    if (typeof window === "undefined") {
      return 0;
    }
    try {
      let cart = localStorage.getItem("cart");
      let quantity = 0;

      if (cart) {
        let cartItems = JSON.parse(cart);

        for (let i = 0; i < cartItems.length; i++) {
          quantity += parseInt(cartItems[i].ordered_quantity);
        }
      }

      return quantity;
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return 0;
    }
  };
  const updateQuantity = () => {
    setQuantity(getQuantity());
  };

  useEffect(() => {
    // Initial quantity update
    updateQuantity();
    // Update quantity when custom event is dispatched
    const handleCartChange = () => {
      updateQuantity();
    };

    window.addEventListener("cartChange", handleCartChange);

    return () => {
      window.removeEventListener("cartChange", handleCartChange);
    };
  }, []);

  return (
    <header className="bg-gray-600 flex items-center justify-between p-4">
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold text-gray-600">
          <img className="w-28" src="/images/logo.png" alt="Logo" />
        </h1>
      </Link>
      <nav className="flex items-center space-x-10 text-3xl font-extrabold text-zinc-200">
        <Link href="/" passHref>
          Home
        </Link>
        <Link href="/catalog" className="hover:text-red-500" passHref>
          Catalog
        </Link>
        {isAuthenticated && (
          <Link href="/dashboard" className="hover:text-red-500" passHref>
            Dashboard
          </Link>
        )}
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="p-5 rounded-xl text-xl bg-red-500 hover:bg-white hover:text-black"
          >
            Sign Out
          </button>
        ) : (
          <Link href="/signin" passHref>
            <button className="p-5 rounded-xl text-xl bg-red-500 hover:bg-white hover:text-black">
              Sign in
            </button>
          </Link>
        )}
        <Link href="/cart" passHref>
          <div className="py-2 relative">
            <img src="/images/bag.svg" alt="cart" className="w-10" />
            <span className="bg-red-500 text-white rounded-full text-xl w-8 h-8 text-center z-10 absolute top-12 left-5">
              {quantity}
            </span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
