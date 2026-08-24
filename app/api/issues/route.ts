export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      photoUrl,
      latitude,
      longitude,
      reporterId,
      severity,
    } = body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    // 1. Find relevant authorities (matching category)
    const authorities = await prisma.authority.findMany({
      where: {
        serviceCategory: category,
        status: "active"
      }
    });

    let nearestAuthority = null;
    let minDistance = Infinity;

    // 2. Find nearest authority
    for (const authority of authorities) {
      if (authority.latitude && authority.longitude) {
        const dist = getDistance(lat, lng, authority.latitude, authority.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestAuthority = authority;
        }
      }
    }

    const anonName = body.anonymousUsername || `Citizen_${reporterId.substring(0, 4)}`;

    // Ensure the reporter user exists (auto-create anonymous user to prevent FK errors)
    await prisma.user.upsert({
      where: { id: reporterId },
      update: {},
      create: {
        id: reporterId,
        fullName: anonName,
        email: `${reporterId}@janseva.local`, // auto-generated placeholder
        anonymousName: anonName,
        role: "USER",
        verified: false,
      }
    });

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        photoUrl: photoUrl || "/placeholder.png",
        latitude: lat,
        longitude: lng,
        locationAddress: body.locationAddress || "Specified Location",
        reporterId,
        anonymousUsername: anonName,
        severity: severity || "minor",
        status: nearestAuthority ? "assigned" : "filed",
        authorityId: nearestAuthority ? nearestAuthority.id : null,
      },
    });

    // 3. Create task if assigned
    if (nearestAuthority) {
      await prisma.task.create({
        data: {
          issueId: issue.id,
          officialId: nearestAuthority.id,
          status: "assigned",
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        }
      });
      
      // Update Authority's current tasks count
      await prisma.authority.update({
         where: { id: nearestAuthority.id },
         data: { currentTasks: { increment: 1 } }
      });
    }

    return NextResponse.json({ issue, assignedTo: nearestAuthority }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reporterId = searchParams.get("reporterId");

  try {
    const issues = await prisma.issue.findMany({
      where: reporterId ? { reporterId } : {},
      include: {
        votes: true,
        authority: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(issues);
  } catch (err) {
    console.error("GET /api/issues error", err);
    return NextResponse.json([]);
  }
}
