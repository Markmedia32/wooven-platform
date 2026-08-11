import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchCurrentUser,
  login as loginRequest,
  signup as signupRequest,
} from "../lib/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("wooven_user")) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const setSession = (nextUser, accessToken) => {
    localStorage.setItem("wooven_access_token", accessToken);
    localStorage.setItem("wooven_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const clearSession = () => {
    localStorage.removeItem("wooven_access_token");
    localStorage.removeItem("wooven_user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("wooven_access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((freshUser) => {
        localStorage.setItem("wooven_user", JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    setSession(response.user, response.accessToken);
    return response.user;
  };

  const signup = async (details) => {
    const response = await signupRequest(details);
    setSession(response.user, response.accessToken);
    return response.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout: clearSession, setSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}