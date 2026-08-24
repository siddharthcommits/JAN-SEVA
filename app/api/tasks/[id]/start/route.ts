import { NextResponse } from "next/server";
import { startTask } from "@/lib/assignment";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;

  try {
    const updatedTask = await startTask(taskId);
    return NextResponse.json({
      taskId: updatedTask.id,
      status: updatedTask.status,
      message: "Task marked as in progress. Now take before photo.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
