import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officialId = searchParams.get("officialId") || "auth_prem_singh";

  try {
    const tasks = await prisma.task.findMany({
      where: {
        officialId: officialId,
      },
      include: {
        issue: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
