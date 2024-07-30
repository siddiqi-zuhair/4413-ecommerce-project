import Link from 'next/link';
import getUser from '@/hooks/getUser';

export default function Sidebar() {
  const { user, loading, error } = getUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-64 h-screen bg-gray-200 p-4">
      <div className="mb-4">
        <h2 className="text-center text-xl font-semibold mt-2">{user?.first_name} {user?.last_name}</h2>
        <p className="text-center text-sm text-gray-600">@{user?.username}</p>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link href="/orders">
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
