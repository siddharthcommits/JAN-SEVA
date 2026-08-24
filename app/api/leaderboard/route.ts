import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await prisma.authorityStats.findMany({
      orderBy: { rewardPoints: "desc" },
      take: 50,
      include: { authority: true },
    });
    return NextResponse.json({ leaderboard: list });
  } catch (err) {
    console.error("leaderboard error", err);
    return NextResponse.json({ leaderboard: [] });
  }
}
