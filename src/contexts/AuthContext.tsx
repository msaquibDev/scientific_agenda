import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, setAccessToken, clearAccessToken } from "../utils/api";
import { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAccessToken(token);
        // Try to get user data or validate token
        const userFromStorage = localStorage.getItem("user");
        if (userFromStorage) {
          setUser(JSON.parse(userFromStorage));
        }
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    clearAccessToken();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
