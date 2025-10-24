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
  const params = await searchParams; // Await searchParams in Next.js 15
  const page = parseInt(params.page || "1");
  const pageSize = 10;

  // Fetch stats and test history in parallel
  const [totalTests, bestTest, tests] = await Promise.all([
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
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name || "User"}! 👋
        </h1>
        <p className="text-gray-600">
          Track your typing progress and see your stats.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Tests</div>
          <div className="text-3xl font-bold text-gray-900">{totalTests}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Best WPM</div>
          <div className="text-3xl font-bold text-gray-900">
            {bestTest?.wpm.toFixed(1) || "—"}
          </div>
          {bestTest && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(bestTest.accuracy * 100)}% accuracy •{" "}
              {bestTest.mode === "time"
                ? `${bestTest.targetValue}s`
                : `${bestTest.targetValue} chars`}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
          <Link
            href="/test"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Start New Test
          </Link>
        </div>
      </div>

      {/* Test History */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Tests
          </h2>
        </div>

        {tests.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No tests yet. Start your first typing test!</p>
            <Link
              href="/test"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Take a test →
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      WPM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Raw WPM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Errors
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(test.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {test.mode === "time"
                          ? `${test.targetValue}s`
                          : `${test.targetValue} chars`}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {test.wpm.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {test.rawWpm.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.round(test.accuracy * 100)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {test.errors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/dashboard?page=${page - 1}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/dashboard?page=${page + 1}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}