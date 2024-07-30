import { useState, useEffect } from 'react';
import getUser from '@/hooks/getUser';
import { useRouter } from 'next/router';

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_admin?: boolean;
};

export default function EditProfile() {
  const { user, loading, error } = getUser();
  const [updatedUser, setUpdatedUser] = useState<User>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUpdatedUser(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const response = await fetch('http://localhost:5000/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...updatedUser, password }),
    });

    if (response.ok) {
      alert('Profile updated successfully!');
    } else {
      const errorText = await response.text();
      console.error('Error updating profile:', errorText);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={updatedUser.username}
            onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={updatedUser.email}
            onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            value={updatedUser.first_name}
            onChange={(e) => setUpdatedUser({ ...updatedUser, first_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            value={updatedUser.last_name}
            onChange={(e) => setUpdatedUser({ ...updatedUser, last_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            id="phone_number"
            value={updatedUser.phone_number}
            onChange={(e) => setUpdatedUser({ ...updatedUser, phone_number: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="text"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
