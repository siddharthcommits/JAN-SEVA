export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function extractIssueId(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const idx = parts.indexOf("issues");
  return parts[idx + 1];
}

export async function GET(req: Request) {
  try {
    const issueId = extractIssueId(req);
    const votesSum = await prisma.vote.aggregate({
      where: { issueId },
      _sum: { value: true },
    });
    const commentsCount = await prisma.comment.count({ where: { issueId } });
    return NextResponse.json({
      votes: votesSum._sum.value || 0,
      comments: commentsCount,
    });
  } catch (err) {
    console.error("meta error", err);
    return NextResponse.json({ votes: 0, comments: 0 });
  }
}
