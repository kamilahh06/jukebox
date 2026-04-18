import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="glass rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/60 to-transparent" />
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-destructive/20 neon-glow-magenta mb-6">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-display text-2xl text-foreground tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {params?.error ? `Error: ${params.error}` : "An unspecified error occurred."}
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary btn-press bg-transparent">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
