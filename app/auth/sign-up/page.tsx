"use client";

import React from "react"

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Disc3 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/onboarding`,
          data: {
            username: username || email.split("@")[0],
            display_name: username || email.split("@")[0],
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-xl holo-gradient flex items-center justify-center neon-glow-violet">
            <Disc3 className="h-7 w-7 text-background" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl text-foreground font-bold tracking-wider">JOIN JUKEBOX</h1>
            <p className="text-sm text-muted-foreground mt-1">Create your account</p>
          </div>
          <div className="w-full glass rounded-xl p-6 border border-border/30">
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-foreground text-xs tracking-wide font-medium">USERNAME</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="coollistener"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-secondary/40 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground text-xs tracking-wide font-medium">EMAIL</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/40 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground text-xs tracking-wide font-medium">PASSWORD</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/40 border-border/30 text-foreground focus:border-primary/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-foreground text-xs tracking-wide font-medium">CONFIRM PASSWORD</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-secondary/40 border-border/30 text-foreground focus:border-primary/40 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)] transition-all"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  className="w-full holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-violet tracking-wide"
                  disabled={isLoading}
                >
                  {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {"Already have an account? "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
