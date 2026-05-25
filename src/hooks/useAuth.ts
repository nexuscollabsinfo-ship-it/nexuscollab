import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  avatar: string | null;
}

export function useAuth() {
  const utils = trpc.useUtils();
  const [authChecked, setAuthChecked] = useState(false);

  const { data: oauthUser, isLoading: oauthLoading } = trpc.auth.me.useQuery(
    undefined,
    { retry: false, refetchOnWindowFocus: false }
  );

  const { data: localUser, isLoading: localLoading } = trpc.localAuth.me.useQuery(
    undefined,
    { retry: false, refetchOnWindowFocus: false }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });

  // Ensure auth check completes on mount
  useEffect(() => {
    if (!oauthLoading && !localLoading) {
      setAuthChecked(true);
    }
  }, [oauthLoading, localLoading]);

  const user: AuthUser | null = oauthUser
    ? {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email,
        role: oauthUser.role,
        avatar: oauthUser.avatar,
      }
    : localUser
    ? {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role,
        avatar: localUser.avatar,
      }
    : null;

  const isAdmin = user?.role === "admin";
  const isLoading = oauthLoading || localLoading || !authChecked;
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        window.location.href = "/";
      },
    });
  }, [logoutMutation]);

  const getOAuthUrl = useCallback(() => {
    const appId = import.meta.env.VITE_APP_ID;
    const authBase = import.meta.env.VITE_KIMI_AUTH_URL;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${authBase}/api/oauth/authorize`);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);

    return url.toString();
  }, []);

  return {
    user,
    isAdmin,
    isLoading,
    isAuthenticated,
    logout,
    getOAuthUrl,
  };
}
