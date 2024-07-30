import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_admin?: boolean;
};

export default function getUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching user info:', error);
      setError('Failed to load user data.');
      setLoading(false);
      router.push('/signin');
    });
  }, [router]);

  return { user, loading, error };
}
