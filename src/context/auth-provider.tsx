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
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
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

interface Pending2FASession {
  accessToken: string;
  user: any;
  roles: any;
  permissions: any;
}

export interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<{ requires2FA?: boolean }>;
  complete2FALogin: (code: string) => Promise<boolean>;
  cancel2FALogin: () => void;
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

  const [pending2FASession, setPending2FASession] = useState<Pending2FASession | null>(null);

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
    async (emailId: string, password: string): Promise<{ requires2FA?: boolean }> => {
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
        const is2FA = !!(loginData?.isTwoFactorAuthenticationEnabled ?? resObj?.isTwoFactorAuthenticationEnabled);

        if (!accessToken || !user) {
          console.error("Login response missing token/user:", response);
          return { requires2FA: false };
        }

        // Check if 2FA TOTP verification is required
        if (is2FA) {
          setPending2FASession({
            accessToken,
            user,
            roles,
            permissions,
          });
          return { requires2FA: true };
        }

        // Standard direct login (no 2FA)
        encryptedStorage.setItem("access_token", accessToken);
        encryptedStorage.setItem("user_data", user);

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
        return { requires2FA: false };
      } catch (err: any) {
        console.error("Sign in failed:", err);
        const msg = err?.response?.data?.message || err?.message || "Invalid credentials";
        showErrorToast(msg);
        return { requires2FA: false };
      } finally {
        setIsLoading(false);
      }
    },
    [router, connectSocket]
  );

  const complete2FALogin = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pending2FASession) {
        showErrorToast("Session expired. Please log in again.");
        return false;
      }

      try {
        setIsLoading(true);
        // Validate 2FA TOTP code with backend
        await apiService.post(
          API_LIST.VALIDATE_MFA,
          { code: code.trim() },
          { headers: { Authorization: `Bearer ${pending2FASession.accessToken}` } }
        );

        // Finalize login session
        encryptedStorage.setItem("access_token", pending2FASession.accessToken);
        encryptedStorage.setItem("user_data", pending2FASession.user);

        try {
          const keyRes = await apiService.get<{ data: { signingKey: string } }>(
            "/registration/session-key",
            undefined,
            { headers: { Authorization: `Bearer ${pending2FASession.accessToken}` } }
          );
          const key = (keyRes as any)?.data?.signingKey || (keyRes as any)?.signingKey;
          if (key) SessionKey.set(key);
        } catch {
          // Ignore key error
        }

        setState({
          user: pending2FASession.user,
          isLoading: false,
          accessToken: pending2FASession.accessToken,
          permissions: extractPermissions(pending2FASession.permissions),
          roles: Array.isArray(pending2FASession.roles) ? pending2FASession.roles : [],
        });

        setPending2FASession(null);
        showSuccessToast("2FA Verification Successful");
        connectSocket();
        router.push("/dashboard");
        return true;
      } catch (err: any) {
        console.error("2FA validation failed:", err);
        const msg = err?.response?.data?.message || err?.message || "Invalid 2FA Verification Code";
        showErrorToast(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [pending2FASession, router, connectSocket]
  );

  const cancel2FALogin = useCallback(() => {
    setPending2FASession(null);
  }, []);

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
      // Silently fail
    }
  }, []);

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
      // Clear session regardless
    } finally {
      setIsLoading(false);
      SessionKey.clear();
      encryptedStorage.clear();
      setPending2FASession(null);
      setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
      router.push("/sign-in");
    }
  }, [router, state.accessToken]);

  const logout = useCallback(async () => {
    SessionKey.clear();
    encryptedStorage.clear();
    setPending2FASession(null);
    setState({ user: null, isLoading: false, accessToken: null, permissions: [], roles: [] });
    router.push("/sign-in");
  }, [router]);

  const updateUser = useCallback((userData: AuthUser) => {
    setState((prev) => ({ ...prev, user: userData }));
    encryptedStorage.setItem("user_data", userData);
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      signIn,
      complete2FALogin,
      cancel2FALogin,
      signOut,
      logout,
      updateUser,
      refreshPermissions,
      switchRole,
    }),
    [state, signIn, complete2FALogin, cancel2FALogin, signOut, logout, updateUser, refreshPermissions, switchRole]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
