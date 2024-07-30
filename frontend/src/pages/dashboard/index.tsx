import getUser from '@/hooks/getUser';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const { user, loading, error } = getUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>First Name:</strong> {user?.first_name}</p>
          <p><strong>Last Name:</strong> {user?.last_name}</p>
          <p><strong>Phone Number:</strong> {user?.phone_number}</p>
          <p><strong>Admin Status:</strong> {user?.is_admin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
