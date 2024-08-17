import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import router from "next/router";
import { useAuth } from "@/context/authContext";
import Loading from "@/components/Loading";
import CheckoutForm from "@/components/CheckoutForm";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : ""
);

export default function Checkout() {
  const { isAuthenticated, user, loading } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [email, setEmail] = useState(user?.email || "");
  const [defaultAddress, setDefaultAddress] = useState(
    user?.default_address || ""
  );

  const fetchCart = async () => {
    try {
      if (!user) return;
      const response = await fetch(
        `http://localhost:5000/carts/user/${user._id}`
      );
      const data = await response.json();
      if (!data.products || data.products.length === 0) {
        // Redirect to cart page if no products
        setTimeout(() => router.push("/catalog"), 2000);
      } else {
        setCart(data.products);
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
      router.push("/cart");
    }
  };

  const calculateTotalPrice = () => {
    // Round to 2 decimal places
    return cart
      .reduce(
        (acc: any, item: any) => acc + item.price * item.ordered_quantity,
        0
      )
      .toFixed(2);
  };

  useEffect(() => {
    if (loading) return;

    if (!user && isAuthenticated === false) {
      setTimeout(() => router.push("/signin"), 2000);
    } else {
      fetchCart();
    }
  }, [user, isAuthenticated, loading]);

  if (loading) return <Loading />;

  // Show message if no user is authenticated and redirect is not instant
  if (!user && isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-144px)] bg-gray-100 text-gray-600">
        <h2 className="text-3xl font-bold">
          You need to sign in to access the checkout page. You will be
          redirected to the sign-in page shortly.
        </h2>
      </div>
    );
  }

  // Handle case when the cart is empty
  if (!cart || (cart.length === 0 && !loading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-144px)] bg-gray-100 text-gray-600">
        <h2 className="text-3xl font-bold">
          Your cart is empty. You will be redirected to the catalog page
          shortly.
        </h2>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-start flex-col p-5 min-h-[calc(100vh-112px)] bg-gray-100 text-gray-600">
      <h1 className="text-8xl font-bold">Checkout</h1>
      <div className="w-full flex flex-row items-start justify-center">
        <div className="w-1/4">
          <div className="flex flex-col w-full mt-10 bg-white rounded-2xl shadow-lg p-5 h-1/6 overflow-scroll">
            {cart.map((product: any) => (
              <div
                key={product._id}
                className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4"
              >
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="text-gray-500 text-lg">
                    Price: ${product.price}
                  </p>
                  <p className="text-gray-500 text-lg">
                    Quantity: {product.ordered_quantity}
                  </p>
                </div>
                <div className="ml-4">
                  <img
                    src={`${product.cover}`}
                    alt={product.name}
                    className="w-32 h-auto object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/4 p-5 pt-20 h-1/2 flex flex-col">
          <p className="text-2xl font-bold pl-3">
            Total Price: ${calculateTotalPrice()}
          </p>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              cart={cart}
              email={email}
              user_id={user?._id}
              defaultAddress={defaultAddress}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}
