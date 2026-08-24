export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiter per user (serverless instances won't share state)
const voteTimestamps = new Map<string, number>();
const VOTE_COOLDOWN_MS = 30_000; // 30 seconds

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { issueId, userId, value } = body;
    if (!issueId || !userId || typeof value !== "number")
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const last = voteTimestamps.get(userId) ?? 0;
    if (Date.now() - last < VOTE_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "Rate limit: try again later" },
        { status: 429 },
      );
    }

    // Check existing vote
    const existing = await prisma.vote.findFirst({
      where: { issueId, userId },
    });
    if (existing) {
      const updated = await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
      voteTimestamps.set(userId, Date.now());
      return NextResponse.json({ vote: updated });
    }

    const vote = await prisma.vote.create({ data: { issueId, userId, value } });
    voteTimestamps.set(userId, Date.now());
    return NextResponse.json({ vote }, { status: 201 });
  } catch (err) {
    console.error("vote error", err);
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
