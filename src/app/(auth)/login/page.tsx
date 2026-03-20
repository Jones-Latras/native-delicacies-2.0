"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button, Input, SurfaceCard } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.18em] text-latik">
            J&J Native Delicacies
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-kape">Welcome back</h1>
          <p className="mt-3 text-latik/68">Sign in to your account to continue</p>
        </div>

        <SurfaceCard className="p-8">
          {error && (
            <div className="mb-4 rounded-[1rem] border border-red-900/15 bg-red-900/8 p-3 text-sm text-red-800/85">
              {error}
            </div>
          )}

          {searchParams.get("registered") === "true" && (
            <div className="mb-4 rounded-[1rem] border border-pandan/15 bg-pandan/10 p-3 text-sm text-pandan">
              Account created successfully! Please sign in.
            </div>
          )}

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

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-latik/72">
                <input type="checkbox" className="rounded border-latik/30 text-pandan focus:ring-pandan/20" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-latik hover:text-pulot">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </SurfaceCard>

        <p className="mt-6 text-center text-sm text-latik/68">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-latik hover:text-pulot">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

