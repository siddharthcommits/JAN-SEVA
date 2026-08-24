import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];
    await prisma.flag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete flag error", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
