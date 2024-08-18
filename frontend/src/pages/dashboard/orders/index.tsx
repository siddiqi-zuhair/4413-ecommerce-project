import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";
export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/signin");
    } else if (loading || !user) {
      return;
    } else {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    if (!user) return;
    const res = await fetch(`http://localhost:5000/orders/user/${user._id}`);
    const data = await res.json();

    // sort orders by purchase date from newest to oldest
    setOrders(
      data.sort(
        (a: any, b: any) =>
          new Date(b.purchase_date).getTime() -
          new Date(a.purchase_date).getTime()
      )
    );
  };
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="bg-gray-200 w-full min-h-[calc(100vh-144px)] p-5 text-gray-600">
        <h1 className="text-7xl font-bold mb-4">Orders</h1>
        <div>
          {orders.length === 0 ? (
            <Loading />
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
