import { useAuthStore } from "@/store/useAuthStore";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const logout = useAuthStore((s) => s.logout);
  return { user, isAuthenticated: !!user, login, signup, logout };
};
