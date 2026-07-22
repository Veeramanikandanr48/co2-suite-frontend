"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "~/lib/api-list";
import { useLoader } from "@/context/loader-context";
import { useSocket } from "@/context/socket-context";
import type { LoginResponse, PermissionEntry, RoleInfo, UserProfile } from "@/types/users";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser extends UserProfile {
  firstName?: string;
  lastName?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  accessToken: string | null;
  /** In-memory only — never stored in localStorage */
  permissions: PermissionEntry[];
  roles: RoleInfo[];
}

export interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: AuthUser) => void;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    accessToken: null,
    permissions: [],
    roles: [],
  });

  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(false);
  const { connect: connectSocket } = useSocket();

  // On mount: restore session from localStorage (token only, not permissions)
  // Permissions are always fetched fresh from the API to avoid stale data.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");

        if (!token || !userData) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const user: AuthUser = JSON.parse(userData);

        // Fetch fresh permissions from the API (not localStorage)
        const permResponse = await apiService.get<{ success: boolean; data: PermissionEntry[] }>(
          API_LIST.GET_MY_PERMISSIONS,
          undefined,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setState({
          user,
          isLoading: false,
          accessToken: token,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          permissions: (permResponse as any)?.data ?? [],
          roles: [],
        });
      } catch {
        // If permissions fetch fails, clear session and force re-login
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) showLoader();
    else hideLoader();
  }, [isLoading, showLoader, hideLoader]);

  const signIn = useCallback(
    async (emailId: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await apiService.post<LoginResponse>(API_LIST.LOGIN, {
          emailId,
          password,
        });

        const loginData = (response as unknown as { data: LoginResponse }).data ?? response;
        const { accessToken, user, roles, permissions } = loginData;

        // Only accessToken goes to localStorage — permissions stay in memory
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user_data", JSON.stringify(user));

        setState({
          user,
          isLoading: false,
          accessToken,
          permissions,
          roles,
        });

        connectSocket();
        router.push("/dashboard");
      } catch {
        // Error handled by axios interceptor (toast)
      } finally {
        setIsLoading(false);
      }
    },
    [router, connectSocket]
  );

  /**
   * Re-fetches permissions from the API.
   * Call this after role switching to update the in-memory ability.
   */
  const refreshPermissions = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const response = await apiService.get<{ success: boolean; data: PermissionEntry[] }>(
        API_LIST.GET_MY_PERMISSIONS,
        undefined,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setState((prev) => ({ ...prev, permissions: (response as any)?.data ?? [] }));
    } catch {
      // Silently fail — permissions stay as-is
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiService.post(API_LIST.LOGOUT, undefined, {
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          "X-Skip-Auth": "true",
        },
      });
    } catch {
      // Always clear session even if logout API fails
    } finally {
      setIsLoading(false);
      localStorage.clear();
      setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
      router.push("/sign-in/admin");
    }
  }, [router, state.accessToken]);

  const logout = useCallback(async () => {
    localStorage.clear();
    setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
    router.push("/sign-in/admin");
  }, [router]);

  const updateUser = useCallback((userData: AuthUser) => {
    setState((prev) => ({ ...prev, user: userData }));
    localStorage.setItem("user_data", JSON.stringify(userData));
  }, []);

  const contextValue = useMemo(
    () => ({ ...state, signIn, signOut, logout, updateUser, refreshPermissions }),
    [state, signIn, signOut, logout, updateUser, refreshPermissions]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
