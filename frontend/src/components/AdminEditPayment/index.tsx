import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type AdminEditPaymentProps = {
  userId: string;
};

const AdminEditPayment = ({ userId }: AdminEditPaymentProps) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [newPaymentLoading, setNewPaymentLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!userId) return;

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/payment-methods/${userId}`, {
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
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [userId]);

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
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, userId }), // Pass userId in the request body
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
          body: JSON.stringify({ userId }) // Pass userId in the request body
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

  if (loadingMethods) {
    return <div>Loading...</div>;
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
