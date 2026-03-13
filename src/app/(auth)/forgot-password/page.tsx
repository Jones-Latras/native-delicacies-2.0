"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";
import { Button, Input } from "@/components/ui";
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
          <Link href="/" className="inline-block text-2xl font-bold text-amber-800">
            Native Delicacies
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Forgot your password?</h1>
          <p className="mt-2 text-stone-500">
            No worries, we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">Check your email</h2>
              <p className="mt-2 text-sm text-stone-500">
                If an account exists with that email, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
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
        </div>

        {!submitted && (
          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
