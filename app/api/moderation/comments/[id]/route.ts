import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Flag a comment for review
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];
    const body = await req.json();
    const { userId, reason } = body;
    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const flag = await prisma.flag.create({
      data: { commentId: id, userId, reason },
    });
    return NextResponse.json({ flag }, { status: 201 });
  } catch (err) {
    console.error("flag error", err);
    return NextResponse.json({ error: "Flag failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Remove a comment (authority/admin action) - placeholder auth
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete comment error", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
