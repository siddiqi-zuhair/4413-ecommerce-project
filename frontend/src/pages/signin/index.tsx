import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/authContext';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        router.push('/dashboard');
      } else {
        const errorText = await response.text();
        console.error('Error signing in:', errorText);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleSignUp}
            className="text-blue-500"
          >
            Create account
          </button>
          <a href="#" className="text-blue-500">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
