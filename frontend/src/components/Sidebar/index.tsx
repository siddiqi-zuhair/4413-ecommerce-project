import Link from "next/link";
import getUser from "@/hooks/getUser";
import Loading from "../Loading";

export default function Sidebar() {
  const { user, loading, error } = getUser();

  if (loading) {
    return <Loading sidebar={true} />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-64 min-h-[calc(100vh-144px)] bg-gray-50 p-4 text-gray-600">
      <div className="mb-4">
        <h2 className="text-center text-3xl font-semibold mt-2">
          {user?.first_name} {user?.last_name}
        </h2>
        <p className="text-center text-md text-gray-600">@{user?.username}</p>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard/orders">
              <span className="flex items-center p-2 text-gray-700 hover:bg-gray-300 rounded-md cursor-pointer">
                Orders
              </span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/profile">
              <span className="flex items-center p-2 text-gray-700 hover:bg-gray-300 rounded-md cursor-pointer">
                Edit Profile Settings
              </span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/payment">
              <span className="flex items-center p-2 text-gray-700 hover:bg-gray-300 rounded-md cursor-pointer">
                Manage Payment Info
              </span>
            </Link>
          </li>
          {user?.is_admin && (
            <li>
              <Link href="/dashboard/admin">
                <span className="flex items-center p-2 text-gray-700 hover:bg-gray-300 rounded-md cursor-pointer">
                  Admin Options
                </span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
