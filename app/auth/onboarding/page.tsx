"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Disc3, ArrowRight } from "lucide-react";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz",
  "Classical", "Country", "Indie", "Latin", "Metal", "Folk",
  "Soul", "Funk", "Reggae", "Blues",
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth/login");
      }
    });
  }, [router]);

  const toggle = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ genre_preferences: selected })
      .eq("id", userId);
    router.push("/");
  };

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-xl holo-gradient flex items-center justify-center neon-glow-violet">
            <Disc3 className="h-7 w-7 text-background" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl text-foreground font-bold tracking-wider">
              WHAT&apos;S YOUR VIBE?
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pick your favorite genres to personalize your feed
            </p>
          </div>

          <div className="w-full glass rounded-xl p-6 border border-border/30">
            <p className="text-xs text-muted-foreground tracking-widest font-medium text-center mb-4">
              SELECT ALL THAT APPLY
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {GENRES.map((genre) => {
                const active = selected.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggle(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 border ${
                      active
                        ? "holo-gradient text-background border-transparent neon-glow-cyan"
                        : "glass border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            {selected.length > 0 && (
              <p className="text-center text-xs text-primary mt-4 tracking-wide">
                {selected.length} genre{selected.length !== 1 ? "s" : ""} selected
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/30 text-muted-foreground hover:bg-secondary/60 bg-transparent"
                onClick={() => router.push("/")}
              >
                SKIP
              </Button>
              <Button
                className="flex-1 holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan tracking-wide"
                onClick={handleSave}
                disabled={saving || selected.length === 0}
              >
                {saving ? "SAVING..." : (
                  <>
                    LET&apos;S GO <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
