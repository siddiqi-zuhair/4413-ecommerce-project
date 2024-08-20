import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import exp from "constants";
import router from "next/router";
import { useEffect, useState } from "react";

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/${user_id}`
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/create-checkout-session`,
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
      const orderResponse = await fetch(
        "${process.env.NEXT_PUBLIC_BACKEND_URL}/orders",
        {
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
        }
      );
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
        <label className="text-2xl font-semibold mb-2">Email: {email}</label>
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
export default CheckoutForm;
