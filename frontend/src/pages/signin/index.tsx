// src/pages/signin/index.tsx
import { useState, FormEvent, MouseEvent } from "react";
import { useRouter } from "next/router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here, e.g., call an API endpoint
    console.log("Logging in with", { email, password });
  };

  const handleSignUp = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push("/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              id="email"
              placeholder="Email or phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handleSignUp}
              className="text-blue-500"
            >
              Create account
            </button>
            <a href="#" className="text-blue-500">
              Forgot email?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
