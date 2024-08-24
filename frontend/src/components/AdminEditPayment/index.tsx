import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Loading from "../Loading";

type AdminEditPaymentProps = {
  userId: string; // Prop to receive the user ID whose payment methods are being managed
};

const AdminEditPayment = ({ userId }: AdminEditPaymentProps) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]); // State to hold the list of payment methods
  const [loadingMethods, setLoadingMethods] = useState(true); // State to track if payment methods are being loaded
  const [newPaymentLoading, setNewPaymentLoading] = useState(false); // State to track if a new payment method is being added
  const stripe = useStripe(); // Hook to get Stripe.js instance
  const elements = useElements(); // Hook to get Stripe Elements instance

  useEffect(() => {
    if (!userId) return;

    // Function to fetch the user's payment methods from the backend
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods"); // Handle unsuccessful fetch
        }

        const data = await response.json(); // Parse the JSON response
        setPaymentMethods(data.paymentMethods); // Update the state with the fetched payment methods
      } catch (error) {
        console.error("Error fetching payment methods:", error); // Log any errors that occur during fetch
      } finally {
        setLoadingMethods(false); // Set loading state to false regardless of success or failure
      }
    };

    fetchPaymentMethods(); // Fetch payment methods when the component mounts or when userId changes
  }, [userId]);

  // Function to handle adding a new payment method
  const handleAddPaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewPaymentLoading(true); // Set loading state for adding a new payment method

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement); // Get the CardElement instance
    if (!cardElement) {
      return;
    }

    // Create a new payment method using the card details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error.message); // Log the error if payment method creation fails
      setNewPaymentLoading(false);
      return;
    }

    try {
      // Send the new payment method to the backend to be associated with the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, userId }), // Include payment method ID and user ID
      });

      if (!response.ok) {
        throw new Error("Failed to add payment method"); // Handle unsuccessful addition
      }

      // Update the state to include the newly added payment method
      setPaymentMethods([...paymentMethods, paymentMethod]);
      cardElement.clear(); // Clear the card input field
    } catch (error) {
      console.error("Error adding payment method:", error); // Log any errors that occur during addition
    } finally {
      setNewPaymentLoading(false); // Reset loading state after attempting to add payment method
    }
  };

  // Function to handle deleting a payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      // Send a request to delete the payment method from the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/delete/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token for authorization
          },
          body: JSON.stringify({ userId }), // Include the user ID in the request body
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment method"); // Handle unsuccessful deletion
      }

      // Update the state to remove the deleted payment method
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentMethodId));
    } catch (error) {
      console.error("Error deleting payment method:", error); // Log any errors that occur during deletion
    }
  };

  if (loadingMethods) {
    return <Loading />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Payment Info for User ID: {userId}</h1>
      <div className="mb-8">
        <h2 className="text-xl mb-2">Payment Methods</h2>
        {paymentMethods.length === 0 ? (
          <p>No payment methods found.</p>
        ) : (
          <ul>
            {paymentMethods.map((pm) => (
              <li
                key={pm.id}
                className={`mb-4 p-2 border border-gray-300 rounded`}
              >
                <div>
                  <span>{pm.card.brand.toUpperCase()} ****{pm.card.last4}</span>
                  <span> - Expires {pm.card.exp_month}/{pm.card.exp_year}</span>
                </div>
                <div className="mt-2">
                  <button
                    className="text-red-600 hover:underline"
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

export default AdminEditPayment;
