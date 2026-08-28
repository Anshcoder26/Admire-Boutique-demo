"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export type UserType = "customer" | "admin";

interface AuthContextType {
  user: AuthUser | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, userType?: UserType) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Validate session on page load
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setUser(null);
        setUserType(null);
        // Clear stored token if session is invalid
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("admire-user-token");
        }
        return false;
      }

      const data = (await response.json()) as { user?: AuthUser; userType?: UserType };
      if (data.user) {
        setUser(data.user);
        setUserType(data.userType || "customer");
        // Store token for reference (actual auth is cookie-based)
        if (typeof window !== "undefined") {
          window.localStorage.setItem("admire-user-token", "authenticated");
        }
        return true;
      }

      setUser(null);
      setUserType(null);
      return false;
    } catch (error) {
      console.error("[AUTH] Session refresh failed:", error);
      setUser(null);
      setUserType(null);
      return false;
    }
  }, []);

  // Initialize on mount and handle storage events
  useEffect(() => {
    // The httpOnly session cookie is the source of truth, so always validate
    // with the server on mount regardless of any localStorage hint.
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await refreshSession();
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    if (typeof window !== "undefined") {
      initAuth();
    }
  }, [refreshSession]);

  // Listen for storage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = window.localStorage.getItem("admire-user-token");
      if (!token && user) {
        // Token was removed, logout
        setUser(null);
      } else if (token && !user && isHydrated) {
        // Token was added, refresh session
        refreshSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user, refreshSession, isHydrated]);

  // Listen for auth updates from login/signup pages
  useEffect(() => {
    const handleAuthUpdate = () => {
      refreshSession();
    };

    window.addEventListener("admire-auth-updated", handleAuthUpdate);
    return () => window.removeEventListener("admire-auth-updated", handleAuthUpdate);
  }, [refreshSession]);

  const login = (newUser: AuthUser, newUserType: UserType = "customer") => {
    setUser(newUser);
    setUserType(newUserType);
    window.localStorage.setItem("admire-user-token", "authenticated");
    window.dispatchEvent(new Event("admire-auth-updated"));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[AUTH] Logout failed:", error);
    } finally {
      setUser(null);
      setUserType(null);
      window.localStorage.removeItem("admire-user-token");
      window.localStorage.removeItem("admire-admin-token");
      window.dispatchEvent(new Event("admire-auth-updated"));
    }
  };

  // Always render the provider (even before hydration) so consumers like the
  // Header/BottomNavigation can call useAuth during SSR/prerender. Initial state
  // (user=null, isLoading=true) is identical on server and first client render,
  // so there is no hydration mismatch.
  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
