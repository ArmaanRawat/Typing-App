"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4C4] via-[#FFDAB9] to-[#FFE4C4] flex items-center justify-center px-6 py-12">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="fixed top-6 left-6 text-[#8B4513] hover:text-[#A0522D] transition-colors flex items-center gap-2 font-medium"
      >
        <span>←</span> Back to Home
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#DEB887]/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">☕</div>
            <h1 className="text-3xl font-bold text-[#8B4513] mb-2">
              Welcome Back!
            </h1>
            <p className="text-[#A0522D]">
              Login to continue your typing journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#8B4513] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[#DEB887] rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all text-[#8B4513] placeholder-[#A0522D]/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#8B4513] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[#DEB887] rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all text-[#8B4513] placeholder-[#A0522D]/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B4513] text-[#FFE4C4] py-3 rounded-lg font-semibold hover:bg-[#A0522D] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Logging in..." : "Login ☕"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DEB887]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#A0522D]">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[#A0522D] text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#8B4513] font-semibold hover:text-[#A0522D] transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Try Link */}
        <div className="text-center mt-6">
          <Link
            href="/test"
            className="text-[#8B4513] hover:text-[#A0522D] transition-colors text-sm font-medium"
          >
            or try without logging in →
          </Link>
        </div>
      </div>
    </div>
  );
}