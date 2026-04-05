"use client";

import { memo, useCallback, useState } from "react";

import { authClient } from "@/shared/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import type { SignInInput, SignUpInput } from "../schema";

// ─── Sign In Form ────────────────────────────────────────────

interface SignInFormProps {
  onSuccess: () => void;
}

export const SignInForm = memo(function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const input: SignInInput = { email, password };

      const { error: authError } = await authClient.signIn.email(
        { email: input.email, password: input.password },
        {
          onSuccess: () => onSuccess(),
          onError: (ctx) => setError(ctx.error.message ?? "Sign in failed"),
        },
      );

      if (authError) {
        setError(authError.message ?? "Sign in failed");
      }
      setLoading(false);
    },
    [email, password, onSuccess],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    [],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="current-password"
          minLength={8}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
});

// ─── Sign Up Form ────────────────────────────────────────────

interface SignUpFormProps {
  onSuccess: () => void;
}

export const SignUpForm = memo(function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const input: SignUpInput = { name, email, password };

      const { error: authError } = await authClient.signUp.email(
        { name: input.name, email: input.email, password: input.password },
        {
          onSuccess: () => onSuccess(),
          onError: (ctx) => setError(ctx.error.message ?? "Sign up failed"),
        },
      );

      if (authError) {
        setError(authError.message ?? "Sign up failed");
      }
      setLoading(false);
    },
    [name, email, password, onSuccess],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    [],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    [],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={handleNameChange}
          required
          autoComplete="name"
          maxLength={30}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
});
