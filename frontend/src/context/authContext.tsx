import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

type User = {
  _id: any;
  id: any;
  username: string;
  email: string;
  default_address: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_admin?: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => void;
  logout: () => void;
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps around parts of the app that need access to authentication state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Manage authentication state
  const [user, setUser] = useState<User | null>(null); // Manage the current user object
  const [loading, setLoading] = useState<boolean>(true); // Manage loading state
  const [error, setError] = useState<string | null>(null); // Manage error state
  const router = useRouter(); // Get the Next.js router for navigation

  // Effect to run when the component mounts to check for an existing token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token); // Fetch user data if token exists
    } else {
      setLoading(false); // Stop loading if no token is found
    }
  }, []);

  // Function to fetch user data from the backend
  const fetchUser = (token: string) => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the request headers
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user info"); // Handle non-200 responses
        }
        return response.json();
      })
      .then((data) => {
        setUser(data); // Set the user data in state
        setIsAuthenticated(true); // Mark the user as authenticated
        setLoading(false); // Stop loading
        updateBackendCart(data._id); // Sync cart with backend
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        setError("Failed to load user data."); // Set error message
        setIsAuthenticated(false); // Mark the user as not authenticated
        setLoading(false); // Stop loading
        localStorage.removeItem("token"); // Remove the token if fetching user data fails
      });
  };

  // Function to handle user login
  const login = (token: string) => {
    localStorage.setItem("token", token); // Store the token in localStorage
    fetchUser(token); // Fetch user data after setting the token
  };

  // Function to update the cart in the backend if the user has items stored locally
  const updateBackendCart = async (userID: any) => {
    const localStorageCart = localStorage.getItem("cart"); // Get the cart from localStorage
    if (localStorageCart) {
      const cartItems = JSON.parse(localStorageCart); // Parse the cart items
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/carts/manage/${userID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products: cartItems }), // Send cart items to backend
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update cart"); // Handle cart update failure
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
      localStorage.removeItem("cart"); // Clear the cart in localStorage after syncing
      const event = new Event("cartChange"); // Dispatch a custom event to notify other parts of the app
      window.dispatchEvent(event);
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    setIsAuthenticated(false); // Mark the user as not authenticated
    setUser(null); // Clear the user object in state
    router.push("/signin"); // Redirect to the sign-in page
  };

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, error, login, logout }}
    >
      {children} 
    </AuthContext.Provider>
  );
};

// Custom hook to consume the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext); // Get the context value
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider"); // Ensure hook is used within the AuthProvider
  }
  return context; // Return the context value
};