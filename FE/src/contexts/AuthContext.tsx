import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, loginWithGoogleApi, getAccountByIdApi } from "../api";

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "consultant" | "customer";
  photoUrl?: string;
  isVerified: boolean;
  isDisabled: boolean;
  phoneNumber?: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (
    email: string,
    username: string,
    photoUrl: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra token và lấy thông tin user khi component mount
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      const fetchUser = async () => {
        try {
          const userData = await getAccountByIdApi(userId);
          setUser(userData);
        } catch (err) {
          console.error("Lỗi khi lấy thông tin user:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userInfo");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.id);
      const userData = await getAccountByIdApi(data.data.id);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (
    email: string,
    username: string,
    photoUrl: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginWithGoogleApi(email, username, photoUrl);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.id);
      const userData = await getAccountByIdApi(data.data.id);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập Google thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
