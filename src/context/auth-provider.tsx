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
import { encryptedStorage } from "@/lib/crypto";
import { SessionKey } from "@/lib/request-signer";
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
  /** Switches the active role, re-issues a JWT, and refreshes CASL permissions atomically. */
  switchRole: (roleId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractPermissions = (res: any): PermissionEntry[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.permissions)) return res.permissions;
  return [];
};

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

  // On mount: restore session from localStorage & fetch in-memory session signing key
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = encryptedStorage.getItem<string>("access_token");
        const user = encryptedStorage.getItem<AuthUser>("user_data");

        if (!token || !user) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Fetch session signing key into memory for HMAC request signing
        try {
          const keyRes = await apiService.get<{ data: { signingKey: string } }>(
            "/registration/session-key",
            undefined,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const key = (keyRes as any)?.data?.signingKey || (keyRes as any)?.signingKey;
          if (key) SessionKey.set(key);
        } catch {
          // Ignore failure to fetch key if route is unauthenticated
        }

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
          permissions: extractPermissions(permResponse),
          roles: [],
        });
      } catch {
        // If permissions fetch fails, clear session and force re-login
        SessionKey.clear();
        encryptedStorage.clear();
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resObj: any = response;
        const loginData = resObj?.data ?? resObj;
        const accessToken = loginData?.accessToken ?? resObj?.accessToken;
        const user = loginData?.user ?? resObj?.user;
        const roles = loginData?.roles ?? resObj?.roles;
        const permissions = loginData?.permissions ?? resObj?.permissions;

        if (!accessToken || !user) {
          console.error("Login response missing token/user:", response);
          return;
        }

        // Store accessToken and user_data in AES-256 encrypted storage
        encryptedStorage.setItem("access_token", accessToken);
        encryptedStorage.setItem("user_data", user);

        // Fetch dedicated session signing key for HMAC signature calculations
        try {
          const keyRes = await apiService.get<{ data: { signingKey: string } }>(
            "/registration/session-key",
            undefined,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const key = (keyRes as any)?.data?.signingKey || (keyRes as any)?.signingKey;
          if (key) SessionKey.set(key);
        } catch {
          // If session key fetch fails, proceed
        }

        setState({
          user,
          isLoading: false,
          accessToken,
          permissions: extractPermissions(permissions),
          roles: Array.isArray(roles) ? roles : [],
        });

        connectSocket();
        router.push("/dashboard");
      } catch (err) {
        console.error("Sign in failed:", err);
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
      const token = encryptedStorage.getItem<string>("access_token");
      if (!token) return;
      const response = await apiService.get<{ success: boolean; data: PermissionEntry[] }>(
        API_LIST.GET_MY_PERMISSIONS,
        undefined,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setState((prev) => ({ ...prev, permissions: extractPermissions(response) }));
    } catch {
      // Silently fail — permissions stay as-is
    }
  }, []);

  /**
   * Switches the active role by calling POST /roles/switch.
   * The backend now issues a fresh JWT with the updated currentRoleId,
   * roleKey, and permissionsVersion, and returns the new permissions.
   * This function stores the new token and rebuilds auth state atomically —
   * no separate refreshPermissions() call is needed.
   */
  const switchRole = useCallback(async (roleId: number) => {
    try {
      const token = encryptedStorage.getItem<string>("access_token");
      if (!token) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiService.post(
        API_LIST.SWITCH_ROLE,
        { roleId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = response?.data ?? response;
      const newToken: string = data?.accessToken;
      const currentRole = data?.currentRole;
      const permissions: PermissionEntry[] = extractPermissions(data?.permissions);

      if (!newToken || !currentRole) return;

      // Store the new token and update state atomically
      encryptedStorage.setItem("access_token", newToken);
      setState((prev) => ({
        ...prev,
        accessToken: newToken,
        permissions,
        user: prev.user
          ? {
              ...prev.user,
              roleKey: currentRole.key,
              roleName: currentRole.name,
              currentRoleId: currentRole.id,
            }
          : prev.user,
      }));
    } catch (err) {
      console.error("Role switch failed:", err);
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
      SessionKey.clear();
      encryptedStorage.clear();
      setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
      router.push("/sign-in");
    }
  }, [router, state.accessToken]);

  const logout = useCallback(async () => {
    SessionKey.clear();
    encryptedStorage.clear();
    setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
    router.push("/sign-in");
  }, [router]);

  const updateUser = useCallback((userData: AuthUser) => {
    setState((prev) => ({ ...prev, user: userData }));
    encryptedStorage.setItem("user_data", userData);
  }, []);

  const contextValue = useMemo(
    () => ({ ...state, signIn, signOut, logout, updateUser, refreshPermissions, switchRole }),
    [state, signIn, signOut, logout, updateUser, refreshPermissions, switchRole]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
