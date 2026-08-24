import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flags = await prisma.flag.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // populate comments for each flag
    const populated = await Promise.all(
      flags.map(async (f) => {
        const comment = await prisma.comment.findUnique({
          where: { id: f.commentId },
        });
        return { flag: f, comment };
      }),
    );

    return NextResponse.json({ flags: populated });
  } catch (err) {
    console.error("flags list error", err);
    return NextResponse.json({ flags: [] });
  }
}
