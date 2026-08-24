export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

async function isAdmin(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const adminList = process.env.ADMIN_EMAILS || "";
  const admins = adminList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return admins.includes(session.user.email as string);
}

export async function POST(req: Request) {
  try {
    const allowed = await isAdmin(req);
    if (!allowed)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 3];
    const body = await req.json();
    const { role } = body;
    if (!id || !role)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const updated = await prisma.user.update({ where: { id }, data: { role } });
    return NextResponse.json({
      user: { id: updated.id, email: updated.email, role: updated.role },
    });
  } catch (err) {
    console.error("set role error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
