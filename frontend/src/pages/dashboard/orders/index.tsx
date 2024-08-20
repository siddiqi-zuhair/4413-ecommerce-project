import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";
interface OrdersProps {
  userId: string;
}

export default function Orders({ userId }: OrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/signin");
    } else if (!user) {
      return;
    } else {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/user/${
        userId ? userId : user._id
      }`
    );
    const data = await res.json();

    // Sort orders by purchase date from newest to oldest
    setOrders(
      data.sort(
        (a: any, b: any) =>
          new Date(b.purchase_date).getTime() -
          new Date(a.purchase_date).getTime()
      )
    );
    setOrdersLoading(false);
  };

  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="bg-gray-200 w-full min-h-[calc(100vh-144px)] p-5 text-gray-600">
        <h1 className="text-7xl font-bold mb-4">Orders</h1>
        <div>
          {loading || ordersLoading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="w-full bg-gray-200 text-gray-600 flex justify-center items-center text-6xl font-bold">
              {userId
                ? "This user currently has no orders"
                : "You currently have no orders"}
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col space-y-2 bg-white p-4 rounded-lg shadow-md"
                >
                  <div className="flex flex-row justify-between">
                    <Link href={`/dashboard/orders/${order._id}`}>
                      <h2 className="text-3xl font-bold">
                        Order ID: {order._id}
                      </h2>
                    </Link>
                    <h2 className="text-3xl font-bold">
                      Total: ${order.total.toFixed(2)}
                    </h2>
                  </div>
                  <div className="flex flex-row justify-between">
                    <h2 className="text-xl">
                      Order Date:{" "}
                      {new Date(order.purchase_date).toLocaleString()}
                    </h2>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {order.products.map((product: any) => (
                      <div
                        key={product._id}
                        className="flex flex-row justify-between"
                      >
                        <h2 className="text-xl">{product.name}</h2>
                        <h2 className="text-xl">
                          ${product.price} x {product.ordered_quantity}
                        </h2>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
