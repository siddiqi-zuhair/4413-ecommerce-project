import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

type User = {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  default_address: string;
  is_admin: boolean;
};

type FormInputs = {
  username: string;
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  default_address: string;
  is_admin: boolean;
};

export default function EditUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      is_admin: false,
    },
  });
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

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

  const checkEmail = async (email: string) => {
    try {
      if (!user) {
        return "User not found";
      }
      const response = await fetch(
        `http://localhost:5000/users/email/${email}`
      );
      const data = await response.json();

      if (data.exists && email === user.email) {
        return true;
      }
      return !data.exists || "Email already in use.";
    } catch {
      return "Error checking email.";
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`);
      const data = await response.json();
      setUser(data);
      setValue("username", data.username);
      setValue("email", data.email);
      setValue("first_name", data.first_name);
      setValue("last_name", data.last_name);
      setValue("phone_number", data.phone_number);
      setValue("is_admin", data.is_admin);
      setValue("default_address", data.default_address);
      setLoading(false);
    } catch (error) {
      setError("Failed to load user data.");
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      if (!user) return;
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("User updated successfully!");
        router.push("/dashboard/admin/users");
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to update user.");
      }
    } catch {
      setError("Failed to update user.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex bg-gray-200 text-gray-600">
      <Sidebar />
      <div className="container mx-auto p-10 sm:p-8">
        <h1 className="text-7xl font-semibold mb-6 text-gray-900">Edit User</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                {...register("last_name", {
                  required: "Last name is required",
                })}
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
                    value:
                      /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
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
              <label htmlFor="is_admin" className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  {...register("is_admin")}
                  className="h-4 w-4 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update User
          </button>
        </form>
      </div>
    </div>
  );
}
