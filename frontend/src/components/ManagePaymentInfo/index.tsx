import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const ManagePaymentInfo = () => {
  const { user, loading, error } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [newPaymentLoading, setNewPaymentLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!user) return;

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/${user._id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment methods");
        }

        const data = await response.json();
        setPaymentMethods(data.paymentMethods);
        setDefaultPaymentMethodId(data.defaultPaymentMethodId); 
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);


  const handleAddPaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewPaymentLoading(true);

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error.message);
      setNewPaymentLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to add payment method");
      }

      // Refresh the payment methods list
      setPaymentMethods([...paymentMethods, paymentMethod]);
      cardElement.clear();
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setNewPaymentLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/delete/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      // Update the state to remove the deleted payment method
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentMethodId));
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/default/${paymentMethodId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      // Update the UI to highlight the new default payment method
      setDefaultPaymentMethodId(paymentMethodId);
    } catch (error) {
      console.error("Error setting default payment method:", error);
    }
  };

  if (loading || loadingMethods) {
    return <div>Loading...</div>;
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
