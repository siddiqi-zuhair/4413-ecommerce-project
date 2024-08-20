import React from "react";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";

export default function SignUp() {
  const router = useRouter();

  interface ContactFormInputs {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>();

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            default_address: data.address,
            is_admin: false,
          }),
        }
      );

      if (response.ok) {
        router.push("/signin");
      } else {
        const errorText = await response.text();
        console.error("Error signing up:", errorText);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  const handleLogin = () => {
    router.push("/signin");
  };

  const checkEmail = async (email: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/email/${email}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return true;
    }
  };

  const checkUsername = async (username: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/username/${username}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
      return true;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] bg-gray-100 text-gray-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-5xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <input
                type="text"
                id="firstName"
                placeholder="First name"
                {...register("firstName", {
                  required: "First name is required",
                })}
                className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? "border-red-500" : ""
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <input
                type="text"
                id="lastName"
                placeholder="Last name"
                {...register("lastName", { required: "Last name is required" })}
                className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? "border-red-500" : ""
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
                validate: async (value) => {
                  const exists = await checkUsername(value);
                  return !exists || "Username already in use.";
                },
              })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? "border-red-500" : ""
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              id="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Entered value does not match email format",
                },
                validate: async (value) => {
                  const exists = await checkEmail(value);
                  return !exists || "Email already in use.";
                },
              })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              id="phone"
              placeholder="Phone"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                  message: "Phone number is invalid",
                },
              })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? "border-red-500" : ""
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              id="address"
              placeholder="Address"
              {...register("address", { required: "Address is required" })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? "border-red-500" : ""
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              id="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-red-500 text-white rounded-xl outline outline-1 hover:bg-white font-bold hover:text-black"
          >
            Create account
          </button>
          <p className="text-center text-sm mt-4 text-gray-600">
            Have an account?{" "}
            <a href="#" onClick={handleLogin} className="text-blue-500">
              Sign in.
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
