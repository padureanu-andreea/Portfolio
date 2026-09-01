import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser } from "../services/authService";

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("smartHireToken"));
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("smartHireToken");
    return savedToken ? decodeToken(savedToken) : null;
  });

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("smartHireToken");
      setUser(null);
      return;
    }

    localStorage.setItem("smartHireToken", token);
    setUser(decodeToken(token));
  }, [token]);

  const login = async ({ email, parola }) => {
    const data = await loginUser({ email, parola });
    setToken(data.token);
  };

  const logout = () => {
    setToken(null);
  };

  const updateCurrentUser = (profileData, newToken) => {
    if (newToken) {
      setToken(newToken);
      return;
    }

    setUser((currentUser) => ({
      ...currentUser,
      nume: profileData.nume,
      prenume: profileData.prenume,
      telefon: profileData.telefon,
    }));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateCurrentUser,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
