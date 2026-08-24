"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function OfficialRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate request
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("demo_logged_in", "true");
      localStorage.setItem("user_role", "authority");
      localStorage.setItem("user_name", "Official User");
      toast.success("Registration request submitted! Pending verification.");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-body pt-28">
      <Toaster position="top-right" />

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 font-headline">
            Official Onboarding
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Register for the secure command & control center.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          {/* Info Banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5">verified_user</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Government Credentials Required
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your account will be pending verification by the District Administrator until your Employee ID and Role are confirmed.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="official-name">
                Official Full Name
              </label>
              <input
                id="official-name"
                type="text"
                required
                placeholder="Ex: Rajesh Kumar"
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="official-email">
                Gov Email or Phone
              </label>
              <input
                id="official-email"
                type="text"
                required
                placeholder="official@gov.in or +91 99999 00000"
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="employee-id">
                  Employee ID
                </label>
                <input
                  id="employee-id"
                  type="text"
                  required
                  placeholder="EMP-2024-XXXX"
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="designation">
                  Designation / Role
                </label>
                <input
                  id="designation"
                  type="text"
                  required
                  placeholder="Ex: Junior Engineer"
                  className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="official-password">
                Secure Password
              </label>
              <div className="relative">
                <input
                  id="official-password"
                  type={showPassword ? "text" : "password"}
                  required
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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="gov-id">
                Gov ID Card Number
              </label>
              <input
                id="gov-id"
                type="text"
                required
                placeholder="Department ID / Aadhar"
                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors font-mono tracking-wider"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration Request"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm">
          <p className="text-slate-500">
            Back to{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Portal Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
