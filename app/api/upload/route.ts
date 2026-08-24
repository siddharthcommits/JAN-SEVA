import { NextResponse } from "next/server";
import { uploadImageFromBase64 } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;
    if (!imageBase64)
      return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const url = await uploadImageFromBase64(imageBase64);
    if (!url)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
