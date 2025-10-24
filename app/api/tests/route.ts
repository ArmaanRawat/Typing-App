import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  durationSec: z.number().int().positive(),
  mode: z.enum(["time", "chars"]),
  targetValue: z.number().int().positive(),
  wpm: z.number(),
  rawWpm: z.number(),
  accuracy: z.number().min(0).max(1),
  backspaces: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  charsTyped: z.number().int().nonnegative(),
  wordsTyped: z.number().int().nonnegative(),
  source: z.string(),
  snippetId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.parse(body);

    const userId = (session.user as any).id as string;

    await prisma.testResult.create({
      data: {
        userId,
        ...parsed,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving test result:", error);
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}