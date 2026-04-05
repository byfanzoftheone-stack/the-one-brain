import { useState, useEffect } from "react";

export type AuthUser = {
  uid: string;
  email: string;
  username: string;
  name: string;
  skill: "Beginner" | "Intermediate" | "Advanced" | "Pro";
  role: "user" | "admin";
  avatar: string | null;
  pingSound: string | null;
};

const STORAGE_KEY = "pb_auth_user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  function login(u: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  function updateUser(updates: Partial<AuthUser>) {
    if (!user) return;
    const next = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }

  function isAdmin() {
    return user?.role === "admin";
  }

  return { user, loading, login, logout, updateUser, isAdmin };
}
