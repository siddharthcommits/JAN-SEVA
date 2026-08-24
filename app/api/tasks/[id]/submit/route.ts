import { NextResponse } from "next/server";
import { submitWork } from "@/lib/assignment";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  
  try {
    const { afterPhotoUrl, notes, latitude, longitude } = await request.json();

    if (!afterPhotoUrl) {
      return NextResponse.json({ error: "After photo is required" }, { status: 400 });
    }

    const updatedTask = await submitWork(
      taskId,
      afterPhotoUrl,
      notes || "",
      latitude || 0,
      longitude || 0
    );

    return NextResponse.json({
      taskId: updatedTask.id,
      status: updatedTask.status,
      submittedAt: updatedTask.submittedAt,
      message: "Submitted for verification",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
