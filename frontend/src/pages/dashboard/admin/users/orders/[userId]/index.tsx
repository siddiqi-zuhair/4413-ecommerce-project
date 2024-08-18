import Loading from "@/components/Loading";
import withAdmin from "@/context/withAdmin";
import Orders from "@/pages/dashboard/orders";
import { useRouter } from "next/router";

function UserOrder() {
  const router = useRouter();
  const { userId } = router.query;

  // Ensure userId is a string
  const userIdString = typeof userId === "string" ? userId : "";

  // Handle the case where userId is undefined or an array
  if (!userIdString) {
    return <Loading />; // or some other placeholder or error handling
  }

  return <Orders userId={userIdString} />;
}
export default withAdmin(UserOrder)