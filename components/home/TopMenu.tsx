"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";
import jukeboxLogo from "@/components/canva/jukebox_logo.png";
import star3 from "@/components/canva/star3.png";

const navItems = [
  { href: "/playlists", label: "Playlists" },
  { href: "/search", label: "Search" },
  { href: "/profile", label: "Profile" },
];

export function TopMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SupaUser | null>(null);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="top-menu-bar h-16 flex items-center justify-between px-4 md:px-6 w-full max-w-7xl mx-auto">
      <Link href="/" className="flex items-center shrink-0" aria-label="Home">
        <Image
          src={jukeboxLogo}
          alt="Jukebox"
          width={350}
          height={50}
          className="block object-contain mt-10 -ml-12"
          unoptimized
          priority
        />
      </Link>

      <div className="flex items-center gap-2 md:gap-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="top-menu-btn y2k-glow-btn"
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          className="top-menu-btn y2k-glow-btn"
        >
          Sign Out
        </button>
        <span
          className="top-menu-star y2k-galaxy-twinkle-star ml-1 hidden sm:block"
          aria-hidden
        >
          <Image
            src={star3}
            alt=""
            width={28}
            height={28}
            className="y2k-galaxy-star-img"
            unoptimized
          />
        </span>
      </div>
    </header>
  );
}
