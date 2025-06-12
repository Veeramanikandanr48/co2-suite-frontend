"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "~/lib/api-list";
// import { LoginResponse } from "~/types/users";
import { useLoader } from "@/context/loader-context";
import { useSocket } from "@/context/socket-context";

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
      setIsLoading(true)
    // Actual login      
    //   const response = await apiService.post<LoginResponse>(API_LIST.LOGIN, {
    //     username,
    //     password,
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-Skip-Toast": "false",
    //     },
    //   }
    // );

    //   if (response?.data?.token) {        
    //     const token = response.data.token;
    //     localStorage.setItem("access_token", token);

    //     // Store user data
    //     const userData = {
    //       id: response.data.id,
    //       userName: response.data.userName,
    //       firstName: response.data.firstName,
    //       lastName: response.data.lastName,
    //       email: response.data.email,
    //       userId: response.data.userId,
    //       idpId: response.data.idpId,
    //       profilePath: response.data.profilePath,
    //       roleId: response.data.roleId
    //     };

    //     localStorage.setItem("user_data", JSON.stringify(userData));
    //     connectSocket();

    //     setState({
    //       user: userData,
    //       isLoading: false,
    //       accessToken: token,
    //     });
    //     router.push("/dashboard/overview");
    //     return; 
    //   }

          // mock login
          const mockLogin: AuthState = {
            user: {
              id: 1,
              userName,
              firstName: "mock",
              lastName: "user",
              email: "mock-email",
              roleId: 1,
              profilePath: "mock-profile-path",
              userId: "mock-user-id",
              idpId: "mock-idp-id",
            },
            isLoading: false,
            accessToken: "mock-token",
          }
    
          localStorage.setItem("access_token", mockLogin.accessToken ?? "");
          localStorage.setItem("user_data", JSON.stringify(mockLogin.user));
          setState(mockLogin);
          connectSocket();
          router.push("/dashboard/overview");
    } catch  {
    } finally {
      setIsLoading(false)
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
      router.push("/sign-in");
    }
  }, [router, state.accessToken]);

  const logout = useCallback(async () => {
    localStorage.clear();
    setState({ user: null, isLoading: false, accessToken: null });
    router.push("/sign-in");
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
