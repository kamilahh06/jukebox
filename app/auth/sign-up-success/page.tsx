import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="glass rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-50" />
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl holo-gradient holo-glow mb-6">
            <Mail className="h-7 w-7 text-background" />
          </div>
          <h1 className="font-display text-2xl text-foreground tracking-tight mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {"We've sent you a confirmation link. Please check your email to verify your account before signing in."}
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
