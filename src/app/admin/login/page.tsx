"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button, Input, Card, CardHeader, CardContent } from "@/components/ui";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials or insufficient permissions");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pulot/14">
            <Shield className="h-7 w-7 text-pulot" strokeWidth={1.5} />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-kape">Admin Portal</h1>
          <p className="mt-2 text-latik/68">Sign in to manage your business</p>
        </div>

        <Card>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-[1rem] border border-red-900/15 bg-red-900/8 p-3 text-sm text-red-800/85">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="admin@jjnativedelicacies.ph"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
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

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-latik/52">
          This portal is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
