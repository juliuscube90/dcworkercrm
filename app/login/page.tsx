"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import { Label, Input, FieldError } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email or password doesn't match our records."
          : error.message
      );
      return;
    }
    const next = searchParams.get("next") || "/dashboard/pipeline";
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Run your pipeline, not spreadsheets."
      subtitle="Track every contact and deal in one shared workspace, built for how agencies actually sell."
      footer={
        <>
          Don&apos;t have a workspace?{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-dark">
            Create one
          </Link>
        </>
      }
    >
      <h2 className="font-[family-name:var(--font-head)] text-2xl font-semibold text-ink-900">
        Sign in
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">Enter your details to access your workspace.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agency.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
