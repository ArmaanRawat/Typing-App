import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#FFE4C4]">
      {/* Navigation */}
      <nav className="bg-[#8B4513] shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⌨️</span>
              <h1 className="text-2xl font-bold text-[#FFE4C4]">TypeCafé</h1>
            </div>

            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/test"
                    className="bg-[#D2691E] text-white px-6 py-2 rounded-full hover:bg-[#CD853F] transition-colors font-semibold"
                  >
                    Start Test
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#D2691E] text-white px-6 py-2 rounded-full hover:bg-[#CD853F] transition-colors font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="mb-6">
            <span className="text-8xl inline-block animate-bounce">☕</span>
          </div>
          <h2 className="text-6xl font-bold text-[#8B4513] mb-6">
            Brew Your Typing Skills
          </h2>
          <p className="text-2xl text-[#A0522D] mb-8 max-w-2xl mx-auto">
            A cozy corner on the web to practice and perfect your typing speed.
            Sip, type, and improve! ☕⌨️
          </p>

          <div className="flex gap-4 justify-center">
            {session?.user ? (
              <Link
                href="/test"
                className="bg-[#8B4513] text-[#FFE4C4] px-10 py-4 rounded-full text-xl font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
              >
                Start Typing Test ✨
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-[#8B4513] text-[#FFE4C4] px-10 py-4 rounded-full text-xl font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/test"
                  className="bg-[#D2691E] text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-[#CD853F] transition-all transform hover:scale-105 shadow-lg"
                >
                  Try Without Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#DEB887] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-[#8B4513] text-center mb-12">
            Why TypeCafé? ☕
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FFE4C4] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">⏱️</div>
              <h4 className="text-2xl font-bold text-[#8B4513] mb-3">
                Timed Tests
              </h4>
              <p className="text-[#A0522D]">
                Challenge yourself with 15s, 30s, or 60s typing sprints. Perfect
                for quick practice sessions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FFE4C4] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h4 className="text-2xl font-bold text-[#8B4513] mb-3">
                Track Progress
              </h4>
              <p className="text-[#A0522D]">
                Monitor your WPM, accuracy, and improvement over time with
                detailed statistics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFE4C4] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">✍️</div>
              <h4 className="text-2xl font-bold text-[#8B4513] mb-3">
                Custom Text
              </h4>
              <p className="text-[#A0522D]">
                Practice with random samples or paste your own text to type what
                matters to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-3xl p-12 text-center shadow-2xl">
          <h3 className="text-4xl font-bold text-[#FFE4C4] mb-12">
            Your Typing Journey Starts Here
          </h3>

          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-5xl font-bold text-[#FFDAB9] mb-2">🎯</div>
              <div className="text-2xl font-bold text-[#FFE4C4]">Real-time</div>
              <div className="text-[#DEB887]">WPM Tracking</div>
            </div>

            <div>
              <div className="text-5xl font-bold text-[#FFDAB9] mb-2">📈</div>
              <div className="text-2xl font-bold text-[#FFE4C4]">Accuracy</div>
              <div className="text-[#DEB887]">Metrics</div>
            </div>

            <div>
              <div className="text-5xl font-bold text-[#FFDAB9] mb-2">💾</div>
              <div className="text-2xl font-bold text-[#FFE4C4]">History</div>
              <div className="text-[#DEB887]">Saved Tests</div>
            </div>

            <div>
              <div className="text-5xl font-bold text-[#FFDAB9] mb-2">🎨</div>
              <div className="text-2xl font-bold text-[#FFE4C4]">Beautiful</div>
              <div className="text-[#DEB887]">Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#DEB887] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-[#8B4513] mb-4">
            Ready to Brew Some Speed? ☕⌨️
          </h3>
          <p className="text-xl text-[#A0522D] mb-8">
            Join TypeCafé today and start your journey to faster, more accurate
            typing!
          </p>

          {!session?.user && (
            <Link
              href="/register"
              className="inline-block bg-[#8B4513] text-[#FFE4C4] px-12 py-4 rounded-full text-xl font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
            >
              Create Free Account 🚀
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#8B4513] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-[#FFE4C4]">
          <p className="mb-2">☕ TypeCafé - Where Typing Meets Coffee ⌨️</p>
          <p className="text-[#DEB887] text-sm">
            Made with ❤️ for typing enthusiasts
          </p>
        </div>
      </footer>
    </div>
  );
}
