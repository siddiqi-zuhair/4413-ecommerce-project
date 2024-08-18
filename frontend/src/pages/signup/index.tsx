import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import getUser from "@/hooks/getUser";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address?: string;
};

type FormInputs = User & { password: string };

export default function EditProfile() {
  const { user, loading, error } = getUser();
  const router = useRouter();

  const { register, handleSubmit, setValue } = useForm<FormInputs>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      // Populate form fields with user data
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("first_name", user.first_name);
      setValue("last_name", user.last_name);
      setValue("phone_number", user.phone_number);
      setValue("address", user.default_address || "");
    }
  }, [user, setValue]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const response = await fetch("http://localhost:5000/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Profile updated successfully!");
    } else {
      const errorText = await response.text();
      console.error("Error updating profile:", errorText);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex bg-gray-200 text-gray-600">
      <Sidebar />
      <div className="container mx-auto p-10 flex-1">
        <h1 className="text-6xl font-bold mb-4">Edit Profile Settings</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              {...register("first_name", {
                required: "First name is required",
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              {...register("last_name", { required: "Last name is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone_number"
              {...register("phone_number", {
                required: "Phone number is required",
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "New password is required",
              })}
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
    </div>
  );
}
