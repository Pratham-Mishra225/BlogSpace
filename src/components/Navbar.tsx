import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X, PenLine } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSearchStore } from "@/store/useSearchStore";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const setQuery = useSearchStore((s) => s.setQuery);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";

  const [authOpen, setAuthOpen] = useState(false);
  const [local, setLocal] = useState("");
  const debounced = useDebounce(local, 300);

  useEffect(() => {
    if (onHome) setQuery(debounced);
    else setQuery("");
  }, [debounced, onHome, setQuery]);

  const goEditor = () => {
    navigate({ to: "/editor" });
  };

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link
            to="/"
            className="font-serif text-2xl font-semibold tracking-tight text-foreground"
          >
            BlogSpace
          </Link>

          {onHome && (
            <div className="relative ml-6 hidden flex-1 max-w-md md:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Search stories, tags, writers…"
                className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              {local && (
                <button
                  onClick={() => setLocal("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goEditor}
              className="hidden gap-2 sm:inline-flex"
            >
              <PenLine className="h-4 w-4" strokeWidth={1.5} />
              Write
            </Button>
            <ThemeSwitcher />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 h-9 w-9 overflow-hidden rounded-full border border-border"
                    aria-label="Account"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground">
                        {user.name?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/profile/$id", params: { id: user.username } })}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/editor" })}>
                    Write a story
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
