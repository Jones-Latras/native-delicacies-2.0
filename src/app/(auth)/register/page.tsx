"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { Button, Input, SurfaceCard } from "@/components/ui";
import { Eye, EyeOff, Check, X } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-xs">
          {check.met ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <X className="h-3 w-3 text-stone-400" />
          )}
          <span className={check.met ? "text-green-700" : "text-stone-500"}>{check.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password") ?? "";

  async function onSubmit(data: RegisterInput) {
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Registration failed. Please try again.");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.18em] text-latik">
            J&J Native Delicacies
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-kape">Create your account</h1>
          <p className="mt-3 text-latik/68">Join us to order authentic Filipino treats</p>
        </div>

        {/* Form */}
        <SurfaceCard className="p-8">
          {error && (
            <div className="mb-4 rounded-[1rem] border border-red-900/15 bg-red-900/8 p-3 text-sm text-red-800/85">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="Juan dela Cruz"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="phone"
              label="Phone number"
              type="tel"
              placeholder="+639171234567"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <div>
              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              <PasswordStrength password={password} />
            </div>

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <label className="flex items-start gap-2 text-sm text-latik/72">
              <input type="checkbox" required className="mt-0.5 rounded border-latik/30 text-pandan focus:ring-pandan/20" />
              <span>
                I agree to the{" "}
                <Link href="/policies/terms" className="text-latik hover:text-pulot hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/policies/privacy" className="text-latik hover:text-pulot hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>
        </SurfaceCard>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-latik/68">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-latik hover:text-pulot">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

