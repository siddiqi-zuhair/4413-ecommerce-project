import getUser from "@/hooks/getUser";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import router from "next/router";
import Loading from "@/components/Loading";

export default function Dashboard() {
  const { user, loading, error } = getUser();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    router.push("/signin");
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex bg-gray-200 text-gray-600">
      <Sidebar />
      <div className="container mx-auto p-10 flex-1">
        <h1 className="text-7xl font-bold mb-4">Dashboard</h1>
        <div className="text-2xl">
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>First Name:</strong> {user?.first_name}
          </p>
          <p>
            <strong>Last Name:</strong> {user?.last_name}
          </p>
          <p>
            <strong>Phone Number:</strong> {user?.phone_number}
          </p>
          <p>
            <strong>Admin Status:</strong> {user?.is_admin ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
