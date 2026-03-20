"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators";
import { Button, Input, SurfaceCard } from "@/components/ui";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <SurfaceCard className="w-full max-w-md p-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-kape">Invalid Reset Link</h1>
          <p className="mt-2 text-latik/68">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot"
          >
            Request a new link
          </Link>
        </SurfaceCard>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, token }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to reset password.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <SurfaceCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pandan/12">
            <CheckCircle className="h-6 w-6 text-pandan" strokeWidth={1.5} />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-kape">Password Reset!</h1>
          <p className="mt-2 text-latik/68">
            Your password has been updated. Redirecting to sign in...
          </p>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.18em] text-latik">
            J&J Native Delicacies
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-kape">Set new password</h1>
          <p className="mt-3 text-latik/68">
            Choose a strong password for your account.
          </p>
        </div>

        <SurfaceCard className="p-8">
          {error && (
            <div className="mb-4 rounded-[1rem] border border-red-900/15 bg-red-900/8 p-3 text-sm text-red-800/85">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                id="password"
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-latik/45 hover:text-latik"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}

