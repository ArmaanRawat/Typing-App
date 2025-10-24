import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = (session.user as any).id as string;
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 10;

  // Fetch stats and test history in parallel
  const [totalTests, bestTest, averageWpm, tests] = await Promise.all([
    prisma.testResult.count({ where: { userId } }),
    prisma.testResult.findFirst({
      where: { userId },
      orderBy: { wpm: "desc" },
      select: {
        wpm: true,
        accuracy: true,
        mode: true,
        targetValue: true,
        createdAt: true,
      },
    }),
    prisma.testResult.aggregate({
      where: { userId },
      _avg: { wpm: true, accuracy: true },
    }),
    prisma.testResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        mode: true,
        targetValue: true,
        errors: true,
        backspaces: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalTests / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4C4] via-[#FFDAB9] to-[#FFE4C4]">
      {/* Floating Navigation */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="bg-[#8B4513]/70 backdrop-blur-lg shadow-xl rounded-full border border-[#A0522D]/20">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">⌨️</span>
                <h1 className="text-xl font-bold text-[#FFE4C4]">TypeCafé</h1>
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-[#FFDAB9] font-medium text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/test"
                  className="bg-[#D2691E] text-white px-5 py-2 rounded-full hover:bg-[#CD853F] transition-all transform hover:scale-105 font-semibold shadow-md text-sm"
                >
                  New Test
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
            Welcome back, {session.user.name || "Typist"}! ☕
          </h1>
          <p className="text-[#A0522D]">
            Here's your typing journey overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* Total Tests */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <div className="text-sm text-[#A0522D]">Total Tests</div>
            </div>
            <div className="text-3xl font-bold text-[#8B4513]">{totalTests}</div>
          </div>

          {/* Best WPM */}
          <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <div className="text-sm text-[#FFE4C4]">Best WPM</div>
            </div>
            <div className="text-3xl font-bold text-[#FFE4C4]">
              {bestTest?.wpm.toFixed(0) || "—"}
            </div>
            {bestTest && (
              <div className="text-xs text-[#DEB887] mt-1">
                {Math.round(bestTest.accuracy * 100)}% accuracy
              </div>
            )}
          </div>

          {/* Average WPM */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📈</span>
              <div className="text-sm text-[#A0522D]">Average WPM</div>
            </div>
            <div className="text-3xl font-bold text-[#8B4513]">
              {averageWpm._avg.wpm?.toFixed(0) || "—"}
            </div>
          </div>

          {/* Average Accuracy */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎯</span>
              <div className="text-sm text-[#A0522D]">Avg Accuracy</div>
            </div>
            <div className="text-3xl font-bold text-[#8B4513]">
              {averageWpm._avg.accuracy
                ? `${Math.round(averageWpm._avg.accuracy * 100)}%`
                : "—"}
            </div>
          </div>
        </div>

        {/* Test History */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#DEB887]/30 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 bg-[#8B4513]/10 border-b border-[#DEB887]/30">
            <h2 className="text-2xl font-semibold text-[#8B4513]">
              Recent Tests 📝
            </h2>
          </div>

          {tests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-5xl mb-4">☕</div>
              <p className="text-[#A0522D] mb-4">
                No tests yet. Start your typing journey!
              </p>
              <Link
                href="/test"
                className="inline-block bg-[#8B4513] text-[#FFE4C4] px-6 py-2 rounded-full hover:bg-[#A0522D] transition-all font-semibold"
              >
                Take Your First Test
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#DEB887]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        WPM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        Raw WPM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#8B4513] uppercase">
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEB887]/20">
                    {tests.map((test) => (
                      <tr
                        key={test.id}
                        className="hover:bg-[#FFE4C4]/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#8B4513]">
                          {new Date(test.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-[#8B4513]/10 text-[#8B4513] px-2 py-1 rounded-full text-xs font-medium">
                            {test.mode === "time"
                              ? `${test.targetValue}s`
                              : `${test.targetValue} chars`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#8B4513]">
                          {test.wpm.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#A0522D]">
                          {test.rawWpm.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#A0522D]">
                          {Math.round(test.accuracy * 100)}%
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium">
                          {test.errors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-[#8B4513]/5 border-t border-[#DEB887]/30 flex items-center justify-between">
                  <div className="text-sm text-[#A0522D]">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link
                        href={`/dashboard?page=${page - 1}`}
                        className="px-4 py-2 bg-white border border-[#DEB887] text-[#8B4513] rounded-lg text-sm hover:bg-[#FFE4C4] transition-colors"
                      >
                        ← Previous
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={`/dashboard?page=${page + 1}`}
                        className="px-4 py-2 bg-[#8B4513] text-[#FFE4C4] rounded-lg text-sm hover:bg-[#A0522D] transition-colors"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}