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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = (token: string) => {
    fetch("http://localhost:5000/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setIsAuthenticated(true);
        setLoading(false);
        updateBackendCart(data._id);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        setError("Failed to load user data.");
        setIsAuthenticated(false);
        setLoading(false);
        localStorage.removeItem("token");
      });
  };

  const login = (token: string) => {
    localStorage.setItem("token", token);
    fetchUser(token);
  };

  const updateBackendCart = async (userID: any) => {
    const localStorageCart = localStorage.getItem("cart");
    if (localStorageCart) {
      const cartItems = JSON.parse(localStorageCart);
      try {
        const response = await fetch(
          `http://localhost:5000/carts/manage/${userID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products: cartItems }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update cart");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
      localStorage.removeItem("cart");
      const event = new Event("cartChange");
      window.dispatchEvent(event);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
