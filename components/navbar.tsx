"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Disc3, Search, ListMusic, User, LogOut, Menu, X, Zap, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { User as SupaUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/search", label: "Search", icon: Search },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
];

const authNavLinks = [
  { href: "/stats", label: "Stats", icon: BarChart2 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/30">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg holo-gradient flex items-center justify-center neon-glow-cyan transition-shadow duration-300 group-hover:neon-glow-violet">
            <Disc3 className="h-5 w-5 text-background" />
          </div>
          <span className="font-display text-lg text-foreground tracking-wider font-semibold">
            JUKEBOX
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[...navLinks, ...(user ? authNavLinks : [])].map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full holo-gradient" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1.5 btn-press"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground gap-1.5 btn-press"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button
                size="sm"
                className="holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground btn-press"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/30 px-5 pb-4 animate-slide-up">
          <nav className="flex flex-col gap-1 pt-2">
            {[...navLinks, ...(user ? authNavLinks : [])].map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-primary font-medium"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
