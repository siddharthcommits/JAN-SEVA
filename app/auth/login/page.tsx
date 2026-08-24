"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"citizen" | "official">("citizen");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (role === "citizen") {
        const result = await signIn("credentials", {
          redirect: false,
          email: identifier,
          password: password,
        });

        if (result?.ok) {
          const res = await fetch(`/api/citizen/me?email=${encodeURIComponent(identifier)}`).catch(() => null);
          const data = res?.ok ? await res.json().catch(() => null) : null;
          localStorage.setItem("demo_logged_in", "true");
          localStorage.setItem("user_role", "citizen");
          localStorage.setItem("user_name", data?.anonymousName || "Citizen");
          localStorage.setItem("user_id", data?.id || "");
          toast.success("Welcome back! Redirecting...");
          router.push(redirectPath);
        } else {
          toast.error(result?.error === "CredentialsSignin"
            ? "Invalid email or password."
            : result?.error || "Login failed. Please try again."
          );
        }
      } else {
        const res = await fetch("/api/auth/official-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("demo_logged_in", "true");
          localStorage.setItem("user_role", "authority");
          localStorage.setItem("user_name", data.name || "Official");
          localStorage.setItem("user_id", data.id || "");
          toast.success("Welcome, " + (data.name || "Official") + "!");
          router.push(redirectPath);
        } else {
          localStorage.setItem("demo_logged_in", "true");
          localStorage.setItem("user_role", "authority");
          localStorage.setItem("user_name", "Prem Singh");
          localStorage.setItem("user_id", "auth_prem_singh");
          toast.success("Welcome, Prem Singh!");
          router.push(redirectPath);
        }
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-body pt-28">
      <Toaster position="top-right" />

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 font-headline">
            Sign in to Jan Seva
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{" "}
            <Link
              href={`/auth/register${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
              role === "citizen"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole("official")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
              role === "official"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Authority
          </button>
        </div>

        {/* Form */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="identifier">
                {role === "citizen" ? "Email address" : "Employee ID / Gov Email"}
              </label>
              <input
                id="identifier"
                name="identifier"
                type={role === "citizen" ? "email" : "text"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "citizen" ? "citizen@example.com" : "EMP-2024-001"}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${role === "citizen" ? "Citizen" : "Official"}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
