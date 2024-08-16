import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import router from "next/router";
import { useAuth } from "@/context/authContext";
import Loading from "@/components/Loading";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : ""
);

const CheckoutForm = ({ cart, email, defaultAddress, user_id }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState(defaultAddress);
  const [isNewAddress, setIsNewAddress] = useState(false);

  const handleAddressChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === "new") {
      setIsNewAddress(true);
      setAddress(""); // Clear address input for new entry
    } else {
      setIsNewAddress(false);
      setAddress(defaultAddress); // Reset to default address
    }
  };

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const response = await fetch(
          `http://localhost:5000/stripe/payment-methods/${user_id}`
        );
        const data = await response.json();
        setSavedPaymentMethods(data.paymentMethods || []);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }
    if (user_id) {
      fetchPaymentMethods();
    }
  }, [user_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cartItems: cart, email: email }),
        }
      );
      const { client_secret } = await response.json();

      let paymentMethod;

      if (selectedPaymentMethod) {
        // Use saved payment method
        const { error: paymentError } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: selectedPaymentMethod,
          }
        );
        if (paymentError) throw paymentError;
      } else {
        // Use new card with CardElement
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const { error: confirmError } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email,
                address: {
                  line1: address,
                },
              },
            },
          }
        );
        if (confirmError) throw confirmError;
      }

      // On successful payment
      const orderResponse = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: cart,
          user_id,
          address,
          purchase_date: new Date(),
          total: cart.reduce(
            (acc: any, item: any) => acc + item.price * item.ordered_quantity,
            0
          ),
          payment_intent: client_secret,
        }),
      });
      const event = new Event("cartChange");
      window.dispatchEvent(event);
      router.push("/success/" + (await orderResponse.json())._id);
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center w-full pt-5 pl-5 text-gray-600"
    >
      <div className="flex flex-col w-full mb-4">
        <label className="text-2xl font-semibold mb-2">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-col w-full mb-4">
        <label className="text-2xl font-semibold mb-2">
          Saved Payment Methods
        </label>
        <select
          className="p-2 rounded-2xl bg-gray-100 border-black border"
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          <option value="">Use a new card</option>
          {savedPaymentMethods.map((method: any) => (
            <option key={method.id} value={method.id}>
              {method.card.brand} **** {method.card.last4}
            </option>
          ))}
        </select>
      </div>
      {!selectedPaymentMethod && (
        <div className="flex flex-col w-full mb-4">
          <label className="text-2xl font-semibold mb-2">Card Details</label>
          <CardElement
            options={{ hidePostalCode: true }}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
      )}
      <div className="flex flex-col w-full mb-4">
        <label className="text-2xl font-semibold mb-2">Address</label>
        <select
          onChange={handleAddressChange}
          className="p-2 border border-black bg-gray-100 rounded-2xl "
          value={isNewAddress ? "new" : "default"}
        >
          <option value="default">{defaultAddress}</option>
          <option value="new">Add New Address</option>
        </select>
        {isNewAddress && (
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter new address"
            className="mt-2 p-2 border border-black rounded-2xl bg-white"
          />
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

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
  if (!cart || cart.length === 0) {
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
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
          <CheckoutForm
            cart={cart}
            email={email}
            defaultAddress={defaultAddress}
            user_id={user?._id}
          />
          <div className="flex justify-end mt-8">
            <p className="text-xl font-semibold">
              Total: ${calculateTotalPrice()}
            </p>
          </div>
        </div>
      </div>
    </Elements>
  );
}
