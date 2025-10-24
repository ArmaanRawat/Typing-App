import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcrypt";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(60),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const exists = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hash(parsed.password, 10);
    await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}