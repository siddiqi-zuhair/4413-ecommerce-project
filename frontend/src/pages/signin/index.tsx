import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authContext";
import toast from "react-hot-toast";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const redirect = router.query.redirect;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        if (redirect !== undefined) {
          router.push(`/${redirect}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        const errorText = await response.text();
        console.error("Error signing in:", errorText);
        toast.error("Error signing in. Please try again.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] bg-gray-100 text-gray-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-5xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-red-500 text-white rounded-xl outline outline-1 hover:bg-white font-bold hover:text-black"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-sm mt-4 text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <a href="#" onClick={handleSignUp} className="text-blue-500">
              Create one.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
