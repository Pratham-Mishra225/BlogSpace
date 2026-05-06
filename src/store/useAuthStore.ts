import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthDTO, ProfileSetupDTO, User } from "@/types";
import {
  _setCurrentUserId,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
} from "@/services/api";

interface AuthState {
  user: User | null;
  login: (data: AuthDTO) => Promise<User>;
  signup: (data: AuthDTO) => Promise<User>;
  logout: () => Promise<void>;
  saveProfile: (data: ProfileSetupDTO) => Promise<User>;
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
        return user;
      },
      signup: async (data) => {
        const user = await apiSignup(data);
        _setCurrentUserId(user.id);
        set({ user });
        return user;
      },
      logout: async () => {
        await apiLogout();
        _setCurrentUserId(null);
        set({ user: null });
      },
      saveProfile: async (data) => {
        const updated = await apiUpdateProfile(data);
        set({ user: updated });
        return updated;
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
