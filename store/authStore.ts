import { create } from "zustand";
import type { AuthResponse, User } from "@/types/auth";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (auth: AuthResponse) => void;
  clearAuth: () => void;
};

function loadAuth() {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null, refreshToken: null };
  }

  return {
    user: JSON.parse(window.localStorage.getItem("seapedia:user") || "null"),
    accessToken: window.localStorage.getItem("seapedia:accessToken"),
    refreshToken: window.localStorage.getItem("seapedia:refreshToken")
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadAuth(),
  setAuth: (auth) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("seapedia:user", JSON.stringify(auth.user));
      window.localStorage.setItem("seapedia:accessToken", auth.accessToken);

      if (auth.refreshToken) {
        window.localStorage.setItem("seapedia:refreshToken", auth.refreshToken);
      }
    }

    set((state) => ({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken || state.refreshToken
    }));
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("seapedia:user");
      window.localStorage.removeItem("seapedia:accessToken");
      window.localStorage.removeItem("seapedia:refreshToken");
    }

    set({ user: null, accessToken: null, refreshToken: null });
  }
}));