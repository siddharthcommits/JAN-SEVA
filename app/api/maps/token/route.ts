import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.MAPPLS_CLIENT_ID;
  const clientSecret = process.env.MAPPLS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Mappls credentials missing" }, { status: 500 });
  }

  try {
    const res = await fetch("https://outpost.mapmyindia.com/api/security/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mappls token error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
