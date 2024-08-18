import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import getUser from "@/hooks/getUser";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_admin?: boolean;
  default_address: string;
};

type FormInputs = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  default_address: string;
  password: string;
};

export default function EditProfile() {
  const { user, loading, error } = getUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      default_address: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("first_name", user.first_name);
      setValue("last_name", user.last_name);
      setValue("phone_number", user.phone_number);
      setValue("default_address", user.default_address);
    }
  }, [user, setValue]);

  const checkEmail = async (email: string) => {
    try {
      if (!user) {
        return "User not found";
      }
      const response = await fetch(
        `http://localhost:5000/users/email/${email}`
      );
      const data = await response.json();
      console.log(data);
      if (data.exists && email === user.email) {
        return true;
      }
      return !data.exists || "Email already in use.";
    } catch {
      return "Error checking email.";
    }
  };

  const checkUsername = async (username: string) => {
    try {
      if (!user) {
        return "User not found";
      }
      const response = await fetch(
        `http://localhost:5000/users/username/${username}`
      );
      const data = await response.json();
      if (data.exists && username === user.username) {
        return true;
      }
      return !data.exists || "Username already in use.";
    } catch {
      return "Error checking username.";
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    console.log(data);
    console.log(user);
    const response = await fetch("http://localhost:5000/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Profile updated successfully!");
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
              {...register("username", {
                required: "Username is required",
                validate: checkUsername,
              })}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
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
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Entered value does not match email format",
                },
                validate: checkEmail,
              })}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
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
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.first_name ? "border-red-500" : ""
              }`}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.first_name.message}
              </p>
            )}
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
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.last_name ? "border-red-500" : ""
              }`}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.last_name.message}
              </p>
            )}
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
                pattern: {
                  value: /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                  message: "Phone number is invalid",
                },
              })}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.phone_number ? "border-red-500" : ""
              }`}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone_number.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Default Address
            </label>
            <input
              type="text"
              id="address"
              {...register("default_address", {
                required: "Address is required",
              })}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.default_address ? "border-red-500" : ""
              }`}
            />
            {errors.default_address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.default_address.message}
              </p>
            )}
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
              {...register("password")}
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
