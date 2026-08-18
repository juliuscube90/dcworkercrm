"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import { Label, Input, FieldError } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, agency_name: agencyName || undefined },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off — the user is already signed in.
      router.push("/dashboard/pipeline");
      router.refresh();
    } else {
      // Confirmation email sent — wait for the user to click through.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="One more step to your pipeline."
        subtitle="Confirm your email and we'll drop you straight into your new workspace."
        footer={
          <>
            Wrong email?{" "}
            <button onClick={() => setCheckEmail(false)} className="font-medium text-accent hover:text-accent-dark">
              Go back
            </button>
          </>
        }
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-head)] text-2xl font-semibold text-ink-900">
          Check your inbox
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          We sent a confirmation link to <span className="font-medium text-ink-700">{email}</span>.
          Click it to activate your workspace and sign in.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Your agency's CRM, set up in a minute."
      subtitle="Contacts, deals, and your team's pipeline — organized from day one."
      footer={
        <>
          Already have a workspace?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-dark">
            Sign in
          </Link>
        </>
      }
    >
      <h2 className="font-[family-name:var(--font-head)] text-2xl font-semibold text-ink-900">
        Create your workspace
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">Free to start — no card required.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jamie Rivera"
            />
          </div>
          <div>
            <Label htmlFor="agencyName">Agency name</Label>
            <Input
              id="agencyName"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
            />
          </div>
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" loading={loading} className="w-full">
          Create workspace
        </Button>
      </form>
    </AuthShell>
  );
}
