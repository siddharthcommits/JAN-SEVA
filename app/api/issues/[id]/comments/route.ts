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
    const comments = await prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("GET comments error", err);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const issueId = extractIssueId(req);
    const body = await req.json();
    const { userId, text, isOfficial } = body;
    if (!userId || !text)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const comment = await prisma.comment.create({
      data: { 
        issueId, 
        userId, 
        text,
        isOfficial: !!isOfficial 
      },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("POST comments error", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
