import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/authContext";
import withAdmin from "@/context/withAdmin";

type User = {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_admin: boolean;
  stripeCustomerId: string;
};

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const loggedInUserId = user?._id;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
      );
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load user data.");
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex bg-gray-200 text-gray-600">
      <Sidebar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
        <table className="min-w-full bg-white">
          <thead className="text-left">
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">User Type</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="py-2 px-4">
                  {user.first_name} {user.last_name}
                </td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">
                  {user.is_admin ? "Admin" : "Member"}
                </td>
                <td className="py-2 px-4">
                  <Link href={`/dashboard/admin/users/orders/${user._id}`}>
                    <span className="p-2 bg-green-500 text-white rounded mr-2">
                      Order History
                    </span>
                  </Link>
                  <Link href={`/dashboard/admin/users/edit/${user._id}`}>
                    <span className="p-2 bg-blue-500 text-white rounded mr-2">
                      Edit
                    </span>
                  </Link>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="p-2 bg-red-500 text-white rounded disabled:brightness-75 disabled:cursor-not-allowed disabled:bg-red-700"
                    disabled={user._id === loggedInUserId}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default withAdmin(UserManagement);
