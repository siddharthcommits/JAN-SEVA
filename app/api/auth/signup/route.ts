import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";

function generateAnonymousName(fullName: string) {
  const initials = fullName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${initials}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, phone } = body;
    if (!fullName || !email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "User exists" }, { status: 409 });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let anonymousName = generateAnonymousName(fullName);
    // ensure uniqueness
    let attempts = 0;
    while (await prisma.user.findUnique({ where: { anonymousName } })) {
      anonymousName = generateAnonymousName(fullName);
      attempts++;
      if (attempts > 5) break;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hash,
        phone,
        anonymousName,
        verified: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          anonymousName: user.anonymousName,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
