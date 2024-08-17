import Sidebar from "@/components/Sidebar";
import OrderSuccess from "@/pages/success/[orderId]";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Order() {
  const router = useRouter();
  const { order } = router.query;

  const fetchOrder = async () => {
    const res = await fetch(`http://localhost:5000/orders/${order}`);
    const data = await res.json();
    console.log(data);
  };
  useEffect(() => {
    if (router.isReady && order) fetchOrder();
  }, [order]);

  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="w-full">
        <OrderSuccess dashboard={true} />
      </div>
    </div>
  );
}
