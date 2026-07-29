"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api/api-service";
import { API_LIST } from "@/lib/api/endpoints";

import { useLoader } from "@/context/loader-provider";
import { useSocket } from "@/context/socket-provider";

export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string | null;
  email: string;
  userId: string;
  idpId: string;
  profilePath: string | null;
  roleId: number;
  organizationId?: number | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    accessToken: null,
  });

  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(false)
  const { connect: connectSocket } = useSocket();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (!token || !userData) {
          setState({ user: null, isLoading: false, accessToken: null });
          return;
        }

        const user: User = JSON.parse(userData);
        setState({ user, isLoading: false, accessToken: token });
      } catch  {
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (userName: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.post<{
        token: string;
        user: User;
        isTwoFactorAuthenticationEnabled?: boolean;
      }>(API_LIST.LOGIN, {
        emailId: userName,
        password,
      });

      const responsePayload = response as unknown as { data?: { token: string; user: User }; token?: string; user?: User };
      const loginData = responsePayload?.data || responsePayload;
      const token = loginData?.token;
      const user = loginData?.user || {
        id: 1,
        userName,
        firstName: userName,
        lastName: null,
        email: userName,
        roleId: 1,
        profilePath: null,
        userId: String(1),
        idpId: "local",
      };

      if (token) {
        const authState: AuthState = {
          user,
          isLoading: false,
          accessToken: token,
        };
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_data", JSON.stringify(user));
        setState(authState);
        connectSocket();
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, connectSocket]);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      await apiService.post(API_LIST.LOGOUT, undefined, {
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          "X-Skip-Auth": "true",
        },
      });
    } catch  {
    } finally {
      setIsLoading(false)
      localStorage.clear();
      router.push("/sign-in/admin");
    }
  }, [router, state.accessToken]);

  const logout = useCallback(async () => {
    localStorage.clear();
    setState({ user: null, isLoading: false, accessToken: null });
    router.push("/sign-in/admin");
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    setState((prev) => ({ ...prev, user: userData }));
    localStorage.setItem("user_data", JSON.stringify(userData));
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      logout,
      updateUser,
    }),
    [state, signIn, signOut, logout, updateUser]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
