import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-200 p-4">
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
        </ul>
      </nav>
    </div>
  );
}
