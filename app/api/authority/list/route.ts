export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const authorities = await prisma.authority.findMany({
      select: {
        id: true,
        name: true,
        jurisdictionWards: true,
        jurisdictionSectors: true,
        totalPoints: true,
        averageRating: true,
        designation: true,
        department: true,
        completedTasks: true,
        currentTasks: true,
      },
      orderBy: { totalPoints: 'desc' }
    });
    
    return NextResponse.json(authorities);
  } catch (error: any) {
    console.error("Authority list API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
