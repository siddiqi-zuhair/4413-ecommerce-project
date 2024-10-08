import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import withAdmin from "@/context/withAdmin";

function AdminOptions() {
  return (
    <div className="flex bg-gray-200 text-gray-600">
      <Sidebar />

      <div className="container mx-auto p-10">
        <h1 className="text-6xl font-bold mb-4">Admin Options</h1>
        <div className="grid space-y-4">
          <Link href="/dashboard/admin/products">
            <span className="block py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 text-center">
              Manage Products
            </span>
          </Link>
          <Link href="/dashboard/admin/users">
            <span className="block py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 text-center">
              Manage Users
            </span>
          </Link>
          <Link href="/dashboard/admin/sales">
            <span className="block py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 text-center">
              Sales History
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default withAdmin(AdminOptions);
