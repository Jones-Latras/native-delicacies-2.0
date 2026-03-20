"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";
import { Button, Input, SurfaceCard } from "@/components/ui";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Always show success to prevent email enumeration
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.18em] text-latik">
            J&J Native Delicacies
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-kape">Forgot your password?</h1>
          <p className="mt-3 text-latik/68">
            No worries, we&apos;ll send you a reset link.
          </p>
        </div>

        <SurfaceCard className="p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pandan/12">
                <Mail className="h-6 w-6 text-pandan" strokeWidth={1.5} />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-kape">Check your email</h2>
              <p className="mt-2 text-sm leading-6 text-latik/68">
                If an account exists with that email, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}
        </SurfaceCard>

        {!submitted && (
          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik/62 hover:text-pulot"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

