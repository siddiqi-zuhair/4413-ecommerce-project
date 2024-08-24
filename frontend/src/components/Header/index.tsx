import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

export default function Header() {
  const [quantity, setQuantity] = useState(0); // State to store the total quantity of items in the cart
  const { isAuthenticated, user, logout } = useAuth(); // Hook to get authentication details

  // Function to calculate the quantity of items in the cart
  const getQuantity = async () => {
    if (typeof window === "undefined") {
      return 0; // Return 0 if the code is running on the server (during SSR)
    }

    if (!user) { // If the user is not logged in
      try {
        let cart = localStorage.getItem("cart"); // Retrieve cart from localStorage
        let quantity = 0;

        if (cart) {
          let cartItems = JSON.parse(cart); // Parse the cart items

          // Sum up the ordered quantities
          for (let i = 0; i < cartItems.length; i++) {
            quantity += parseInt(cartItems[i].ordered_quantity);
          }
        }

        return quantity; // Return the calculated quantity
      } catch (error) {
        console.error("Error reading cart from localStorage:", error);
        return 0; // Return 0 if there's an error
      }
    } else { // If the user is logged in
      try {
        let response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/carts/${user._id}` // Fetch the cart from the server using the user ID
        );
        let cart = await response.json();
        let quantity = 0;

        // Sum up the ordered quantities from the server response
        if (cart.products && cart.products.length > 0) {
          for (let i = 0; i < cart.products.length; i++) {
            quantity += parseInt(cart.products[i].ordered_quantity);
          }
        }

        return quantity; // Return the calculated quantity
      } catch (error) {
        console.error("Error fetching cart from server:", error);
        return 0; // Return 0 if there's an error
      }
    }
  };

  // Function to update the cart quantity in the component's state
  const updateQuantity = async () => {
    const newQuantity = await getQuantity(); // Get the latest quantity
    setQuantity(newQuantity); // Update the state with the new quantity
  };

  // useEffect to update the quantity when the component mounts or when the authentication state changes
  useEffect(() => {
    if (typeof isAuthenticated === "undefined") {
      return; // Do nothing if the authentication state is not yet known
    }

    updateQuantity(); // Update the quantity initially

    // Event listener to handle cart changes
    const handleCartChange = async () => {
      await updateQuantity();
    };

    window.addEventListener("cartChange", handleCartChange); // Add event listener

    return () => {
      window.removeEventListener("cartChange", handleCartChange); // Clean up the event listener on component unmount
    };
  }, [isAuthenticated]); // Dependency array to re-run the effect when the authentication state changes



  return (
    <header className="bg-gray-600 flex items-center justify-between p-4">
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold text-gray-600 ">
          <img className="w-28 rounded-lg" src="/images/logo.png" alt="Logo" />
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
          <div className="p-4 relative">
            <img src="/images/bag.svg" alt="cart" className="w-12" />
            <span className="bg-red-500 text-white rounded-full text-xl w-8 h-8 text-center z-10 absolute top-16 left-12">
              {quantity}
            </span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
