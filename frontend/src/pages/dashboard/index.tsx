import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    fetch('http://localhost:5000/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      return response.json();
    })
    .then(data => setUser(data))
    .catch(error => {
      console.error('Error fetching user info:', error);
      router.push('/signin');
    });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>First Name:</strong> {user.first_name}</p>
        <p><strong>Last Name:</strong> {user.last_name}</p>
        <p><strong>Phone Number:</strong> {user.phone_number}</p>
      </div>
    </div>
  );
}
