import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthDTO, User } from "@/types";
import { _setCurrentUserId, login as apiLogin, signup as apiSignup } from "@/services/api";

interface AuthState {
  user: User | null;
  login: (data: AuthDTO) => Promise<void>;
  signup: (data: AuthDTO) => Promise<void>;
  logout: () => void;
  _hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: async (data) => {
        const user = await apiLogin(data);
        _setCurrentUserId(user.id);
        set({ user });
      },
      signup: async (data) => {
        const user = await apiSignup(data);
        _setCurrentUserId(user.id);
        set({ user });
      },
      logout: () => {
        _setCurrentUserId(null);
        set({ user: null });
      },
      _hydrate: () => {
        const u = get().user;
        _setCurrentUserId(u?.id ?? null);
      },
    }),
    {
      name: "blogspace-auth",
      onRehydrateStorage: () => (state) => state?._hydrate(),
    },
  ),
);
