import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hotelpro_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(Boolean(localStorage.getItem("hotelpro_token")));

  useEffect(() => {
    const token = localStorage.getItem("hotelpro_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("hotelpro_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("hotelpro_token");
        localStorage.removeItem("hotelpro_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("hotelpro_token", data.token);
    localStorage.setItem("hotelpro_user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success(data.message || `Welcome back, ${data.user.name.split(" ")[0]}!`);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    localStorage.setItem("hotelpro_token", data.token);
    localStorage.setItem("hotelpro_user", JSON.stringify(data.user));
    setUser(data.user);
    toast.success(data.message || "Account created successfully!");
    return data.user;
  };

  const signOut = () => {
    localStorage.removeItem("hotelpro_token");
    localStorage.removeItem("hotelpro_user");
    setUser(null);
    toast.info("You have been signed out.");
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put("/auth/profile", profileData);
    setUser(data.user);
    localStorage.setItem("hotelpro_user", JSON.stringify(data.user));
    toast.success(data.message || "Profile updated.");
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
