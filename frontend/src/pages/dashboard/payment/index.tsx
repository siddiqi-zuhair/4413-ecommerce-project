import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ManagePaymentInfo from "../../../components/ManagePaymentInfo";
import Sidebar from "@/components/Sidebar";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const PaymentPage = () => {
    return (
        <div className="flex bg-gray-200 text-gray-600">
            <Sidebar />
            <Elements stripe={stripePromise}>
                <ManagePaymentInfo />
            </Elements>
        </div>
    );
};

export default PaymentPage;
