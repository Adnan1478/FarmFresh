import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUserApi, registerUserApi, getMeApi, logoutUserApi } from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on app mount from Express backend (/api/auth/me)
  const checkSession = async () => {
    try {
      setIsLoading(true);
      const res = await getMeApi();
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Direct backend API login -> writes to Express & MongoDB
  const login = async (credentials) => {
    try {
      const res = await loginUserApi(credentials);
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data?.message || "Login failed");
    } catch (err) {
      const errorMsg = err.message || "Invalid credentials. Please check your email and password.";
      throw new Error(errorMsg);
    }
  };

  // Direct backend API register -> creates User document in MongoDB collection
  const register = async (userData) => {
    try {
      const res = await registerUserApi(userData);
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data?.message || "Registration failed");
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Please check your information.";
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      // Continue cleanup
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkSession();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
