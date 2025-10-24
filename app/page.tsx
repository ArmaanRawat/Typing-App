import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4C4] via-[#FFDAB9] to-[#FFE4C4]">
      {/* Floating Glassy Navigation */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="bg-[#8B4513]/70 backdrop-blur-lg shadow-xl rounded-full border border-[#A0522D]/20">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⌨️</span>
                <h1 className="text-xl font-bold text-[#FFE4C4]">TypeCafé</h1>
              </div>

              <div className="flex items-center gap-4">
                {session?.user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors font-medium text-sm"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/test"
                      className="bg-[#D2691E] text-white px-5 py-2 rounded-full hover:bg-[#CD853F] transition-all transform hover:scale-105 font-semibold shadow-md text-sm"
                    >
                      Start Test
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-[#FFE4C4] hover:text-[#FFDAB9] transition-colors font-medium text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-[#D2691E] text-white px-5 py-2 rounded-full hover:bg-[#CD853F] transition-all transform hover:scale-105 font-semibold shadow-md text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="text-center">
          <div className="mb-4">
            <span className="text-6xl inline-block animate-bounce">☕</span>
          </div>
          <h2 className="text-5xl font-bold text-[#8B4513] mb-4 leading-tight">
            Brew Your Typing Skills
          </h2>
          <p className="text-lg text-[#A0522D] mb-6 max-w-xl mx-auto">
            A cozy corner on the web to practice and perfect your typing speed.
            Sip, type, and improve! ☕⌨️
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            {session?.user ? (
              <Link
                href="/test"
                className="bg-[#8B4513] text-[#FFE4C4] px-8 py-3 rounded-full text-lg font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
              >
                Start Typing Test ✨
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-[#8B4513] text-[#FFE4C4] px-8 py-3 rounded-full text-lg font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/test"
                  className="bg-[#D2691E] text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-[#CD853F] transition-all transform hover:scale-105 shadow-lg"
                >
                  Try Without Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#DEB887]/50 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#8B4513] text-center mb-10">
            Why TypeCafé? ☕
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">⏱️</div>
              <h4 className="text-xl font-bold text-[#8B4513] mb-2">
                Timed Tests
              </h4>
              <p className="text-[#A0522D] text-sm leading-relaxed">
                Challenge yourself with 15s, 30s, or 60s typing sprints. Perfect
                for quick practice sessions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="text-xl font-bold text-[#8B4513] mb-2">
                Track Progress
              </h4>
              <p className="text-[#A0522D] text-sm leading-relaxed">
                Monitor your WPM, accuracy, and improvement over time with
                detailed statistics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">✍️</div>
              <h4 className="text-xl font-bold text-[#8B4513] mb-2">
                Custom Text
              </h4>
              <p className="text-[#A0522D] text-sm leading-relaxed">
                Practice with random samples or paste your own text to type what
                matters to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-2xl p-10 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-[#FFE4C4] mb-8">
            Your Typing Journey Starts Here
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-lg font-bold text-[#FFE4C4]">Real-time</div>
              <div className="text-[#DEB887] text-sm">WPM Tracking</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-lg font-bold text-[#FFE4C4]">Accuracy</div>
              <div className="text-[#DEB887] text-sm">Metrics</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">💾</div>
              <div className="text-lg font-bold text-[#FFE4C4]">History</div>
              <div className="text-[#DEB887] text-sm">Saved Tests</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-lg font-bold text-[#FFE4C4]">Beautiful</div>
              <div className="text-[#DEB887] text-sm">Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#DEB887]/50 backdrop-blur-sm py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-[#8B4513] mb-3">
            Ready to Brew Some Speed? ☕⌨️
          </h3>
          <p className="text-lg text-[#A0522D] mb-6">
            Join TypeCafé today and start your journey to faster, more accurate
            typing!
          </p>

          {!session?.user && (
            <Link
              href="/register"
              className="inline-block bg-[#8B4513] text-[#FFE4C4] px-10 py-3 rounded-full text-lg font-bold hover:bg-[#A0522D] transition-all transform hover:scale-105 shadow-lg"
            >
              Create Free Account 🚀
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#8B4513] py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-[#FFE4C4]">
          <p className="mb-1 text-sm">☕ TypeCafé - Where Typing Meets Coffee ⌨️</p>
          <p className="text-[#DEB887] text-xs">
            Made with ❤️ for typing enthusiasts
          </p>
        </div>
      </footer>
    </div>
  );
}
