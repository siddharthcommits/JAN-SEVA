import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const inProgressCount = await prisma.issue.count({
      where: {
        reporterId: userId,
        status: { in: ["in_progress", "assigned"] },
      },
    });

    const resolvedCount = await prisma.issue.count({
      where: {
        reporterId: userId,
        status: { in: ["resolved", "approved", "verified"] },
      },
    });

    const votesCast = await prisma.vote.count({
      where: {
        userId: userId,
      },
    });

    const upvotesReceived = await prisma.vote.count({
      where: {
        issue: { reporterId: userId },
        value: 1,
      },
    });

    const score = (user._count.reports * 10) + (votesCast * 5) + (upvotesReceived * 2);

    return NextResponse.json({
      totalReports: user._count.reports,
      inProgress: inProgressCount,
      resolvedReports: resolvedCount,
      votesCast: votesCast,
      communityVotes: upvotesReceived,
      score: score,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
