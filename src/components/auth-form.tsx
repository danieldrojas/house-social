"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/auth";
import { Button, Input, Label } from "@/components/ui";

export function AuthForm({
  action,
  mode,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "login" | "signup";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Alex"
            autoComplete="name"
          />
        </div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </div>
      {state.error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </Button>
    </form>
  );
}
