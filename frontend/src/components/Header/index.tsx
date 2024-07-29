import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useAuth } from '@/context/authContext';

export default function Header() {
  const [quantity, setQuantity] = useState(0);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

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
          quantity += cartItems[i].quantity;
        }
      }

      return quantity;
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return 0;
    }
  };

  useEffect(() => {
    const quantity = getQuantity();
    setQuantity(quantity);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  return (
    <header className="bg-gray-600 flex items-center justify-between">
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold text-gray-600">
          <img className="w-28" src="/images/logo.png" alt="Logo" />
        </h1>
      </Link>
      <nav className="flex items-center space-x-10 text-3xl font-extrabold text-zinc-200 pr-10">
        <Link href="/" passHref>
          Home
        </Link>
        <Link href="/catalog" className="hover:text-red-500" passHref>
          Catalog
        </Link>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="p-5 rounded-xl text-xl bg-red-500 hover:bg-white hover:text-black"
          >
            Log out
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
