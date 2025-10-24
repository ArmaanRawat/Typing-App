import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Typing Speed Test",
  description: "Test and improve your typing speed",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <SessionProvider session={session}>
          <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  ⌨️ TypingApp
                </Link>
                <div className="flex gap-4">
                  <Link
                    href="/test"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Test
                  </Link>
                  {session?.user && (
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {session?.user ? (
                  <>
                    <span className="text-sm text-gray-600">
                      {session.user.email}
                    </span>
                    <a
                      href="/api/auth/signout"
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      Logout
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
