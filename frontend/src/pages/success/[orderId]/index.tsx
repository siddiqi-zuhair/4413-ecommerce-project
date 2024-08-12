import { useRouter } from "next/router";
import { useEffect, useState } from "react";
export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (orderId) {
      console.log("Order ID:", orderId);
      fetchOrder();
    } else {
      return;
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5000/orders/${orderId}`);
      const data = await response.json();
      console.log(data);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-10 h-screen bg-gray-100 text-gray-700">
      <h1 className="text-5xl font-bold mb-4">Thanks for your order!</h1>
      <p className="text-4xl">Order summary:</p>
      {order && (
        <div className="mt-4 pt-5">
          {order.products.map((product: any) => (
            <div
              key={product._id}
              className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4"
            >
              <div className="flex flex-col flex-grow">
                <h3 className="text-3xl font-semibold">{product.name}</h3>
                <p className="text-gray-500 text-xl">Price: ${product.price}</p>
                <p className="text-gray-500 text-xl">
                  Quantity: {product.ordered_quantity}
                </p>
              </div>
              <div className="ml-4">
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${product.cover}.jpg`}
                  alt={product.name}
                  className="w-32 h-auto object-cover"
                />
              </div>
            </div>
          ))}
          <p className="text-2xl">Shipping Address: {order.address}</p>
          <p className="text-2xl">Total: ${order.total}</p>
        </div>
      )}
    </div>
  );
}
