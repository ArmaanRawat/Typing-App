"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Registration successful but login failed");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
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

      {/* Register Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#DEB887]/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-3xl font-bold text-[#8B4513] mb-2">
              Join TypeCafé
            </h1>
            <p className="text-[#A0522D]">Start your typing journey today!</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#8B4513] mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[#DEB887] rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all text-[#8B4513] placeholder-[#A0522D]/50"
                placeholder="John Doe"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-[#DEB887] rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all text-[#8B4513] placeholder-[#A0522D]/50"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#A0522D] mt-1">
                At least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B4513] text-[#FFE4C4] py-3 rounded-lg font-semibold hover:bg-[#A0522D] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Creating account..." : "Create Account 🚀"}
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-[#A0522D] text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#8B4513] font-semibold hover:text-[#A0522D] transition-colors"
              >
                Login
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
            or try without signing up →
          </Link>
        </div>
      </div>
    </div>
  );
}