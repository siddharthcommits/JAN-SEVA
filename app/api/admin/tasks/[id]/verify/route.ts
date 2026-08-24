export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { verifyWork } from "@/lib/assignment";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  
  try {
    const { decision, reason } = await request.json();

    if (!decision || !["approve", "reject"].includes(decision)) {
      return NextResponse.json({ error: "Valid decision (approve/reject) is required" }, { status: 400 });
    }

    await verifyWork(taskId, decision, reason || "No reason provided");

    return NextResponse.json({
      taskId: taskId,
      status: decision === "approve" ? "verified" : "rejected",
      decision: decision,
      message: decision === "approve" ? "Work approved and points awarded" : "Work rejected and task returned to official",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
