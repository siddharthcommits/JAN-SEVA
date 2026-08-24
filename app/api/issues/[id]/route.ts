export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: params.id },
      include: {
        reporter: true,
        authority: true,
        comments: true,
        votes: true,
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
