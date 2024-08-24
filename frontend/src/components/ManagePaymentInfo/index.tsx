import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Loading from "../Loading";

const ManagePaymentInfo = () => {
  const { user, loading, error } = useAuth(); // Custom hook to get the current user, loading state, and authentication error
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]); // State to store the user's payment methods
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null); // State to track the default payment method ID
  const [loadingMethods, setLoadingMethods] = useState(true); // State to track if payment methods are being loaded
  const [newPaymentLoading, setNewPaymentLoading] = useState(false); // State to track if a new payment method is being added
  const stripe = useStripe(); // Hook to access the Stripe.js instance
  const elements = useElements(); // Hook to access Stripe Elements

  // Effect to fetch the user's payment methods when the component mounts or when the user changes
  useEffect(() => {
    if (!user) return;

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/${user._id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        const data = await response.json();
        setPaymentMethods(data.paymentMethods); // Update state with the fetched payment methods
        setDefaultPaymentMethodId(data.defaultPaymentMethodId); // Set the default payment method ID
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setLoadingMethods(false); // Stop loading indicator
      }
    };

    fetchPaymentMethods(); // Fetch payment methods
  }, [user]);

  // Handler to add a new payment method
  const handleAddPaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewPaymentLoading(true); // Start loading indicator

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement); // Get the card element from Stripe Elements
    if (!cardElement) {
      return;
    }

    // Create a new payment method using the card details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error.message);
      setNewPaymentLoading(false); // Stop loading indicator
      return;
    }

    try {
      // Send the new payment method to the backend to be saved
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }), // Include payment method ID
      });

      if (!response.ok) {
        throw new Error("Failed to add payment method");
      }

      // Refresh the payment methods list
      setPaymentMethods([...paymentMethods, paymentMethod]); // Add the new payment method to the state
      cardElement.clear(); // Clear the card input
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setNewPaymentLoading(false); // Stop loading indicator
    }
  };

  // Handler to delete a payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/delete/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      // Update the state to remove the deleted payment method
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentMethodId)); // Remove the deleted payment method from the state
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  // Handler to set a payment method as the default
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/default/${paymentMethodId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      // Update the UI to highlight the new default payment method
      setDefaultPaymentMethodId(paymentMethodId); // Set the new default payment method ID in the state
    } catch (error) {
      console.error("Error setting default payment method:", error);
    }
  };

  if (loading || loadingMethods) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Payment Info</h1>
      <div className="mb-8">
        <h2 className="text-xl mb-2">Your Payment Methods</h2>
        {paymentMethods.length === 0 ? (
          <p>No payment methods found.</p>
        ) : (
          <ul>
            {paymentMethods.map((pm) => (
              <li
                key={pm.id}
                className={`mb-4 p-2 border ${pm.id === defaultPaymentMethodId ? "border-green-500" : "border-gray-300"
                  } rounded`}
              >
                <div>
                  <span>{pm.card.brand.toUpperCase()} ****{pm.card.last4}</span>
                  <span> - Expires {pm.card.exp_month}/{pm.card.exp_year}</span>
                  {pm.id === defaultPaymentMethodId && (
                    <span className="ml-2 text-green-500 font-semibold">(Default)</span>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                  >
                    {pm.id === defaultPaymentMethodId ? "Default" : "Set as Default"}
                  </button>
                  <button
                    className="text-red-600 hover:underline ml-4"
                    onClick={() => handleDeletePaymentMethod(pm.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}

          </ul>
        )}
      </div>
      <div>
        <h2 className="text-xl mb-2">Add New Payment Method</h2>
        <form onSubmit={handleAddPaymentMethod}>
          <div className="mb-4">
            <CardElement />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded"
            disabled={!stripe || newPaymentLoading}
          >
            {newPaymentLoading ? "Adding..." : "Add Payment Method"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagePaymentInfo;
