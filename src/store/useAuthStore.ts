import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthDTO, ProfileSetupDTO, User } from "@/types";
import {
  _setCurrentUserId,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
  getMe,
} from "@/services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (data: AuthDTO) => Promise<User>;
  signup: (data: AuthDTO) => Promise<User>;
  logout: () => Promise<void>;
  saveProfile: (data: ProfileSetupDTO) => Promise<User>;
  restoreSession: () => Promise<void>;
  _hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (data) => {
        const result = await apiLogin(data);
        const { token, ...user } = result;
        _setCurrentUserId(user.id);
        set({ user, token: token ?? null });
        return user;
      },

      signup: async (data) => {
        const result = await apiSignup(data);
        const { token, ...user } = result;
        _setCurrentUserId(user.id);
        set({ user, token: token ?? null });
        return user;
      },

      logout: async () => {
        await apiLogout();
        _setCurrentUserId(null);
        set({ user: null, token: null });
      },

      saveProfile: async (data) => {
        const updated = await apiUpdateProfile(data);
        // Mark the profile as complete once saved.
        const withFlag: User = { ...updated, isProfileComplete: true };
        set({ user: withFlag });
        return withFlag;
      },

      /**
       * Called on app boot if a token already exists in storage.
       * Re-fetches the user from the backend to ensure the token is still valid
       * and the stored user object is fresh.
       */
      restoreSession: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await getMe();
          set({ user: { ...user, isProfileComplete: !!user.username } });
          _setCurrentUserId(user.id);
        } catch {
          // Token is expired / invalid — clear state so the user sees the login prompt.
          set({ user: null, token: null });
          _setCurrentUserId(null);
        }
      },

      _hydrate: () => {
        const u = get().user;
        _setCurrentUserId(u?.id ?? null);
      },
    }),
    {
      name: "blogspace-auth",
      // Only persist user and token — actions are recreated each render.
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => state?._hydrate(),
    }
  )
);
