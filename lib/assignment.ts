// Trigger build with new environment variables
import prisma from "@/lib/prisma";
import { Issue, Authority, Task } from "@prisma/client";

// Polyfill or external dependency for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Return distance in km
  const R = 6371;
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

/**
 * PHASE 1: Auto-assign report to best official
 */
export async function assignReportToOfficial(issueId: string) {
  console.log("Starting auto-assignment for:", issueId);

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!issue) throw new Error("Issue not found");

  // 1. Find eligible officials
  const eligibleOfficials = await findEligibleOfficials(
    issue.category,
    issue.latitude,
    issue.longitude,
    issue.severity
  );

  console.log("Found eligible officials:", eligibleOfficials.length);

  if (eligibleOfficials.length === 0) {
    console.log("No eligible officials - escalating to supervisor");
    // escalateToSupervisor(issue);
    return null;
  }

  // 2. Rank officials by performance
  const rankedOfficials = rankOfficialsByPerformance(eligibleOfficials);
  console.log(
    "Ranked officials:",
    rankedOfficials.map((o) => o.name)
  );

  // 3. Select best match
  const assignedOfficial = rankedOfficials[0];

  // 4. Set deadline
  const deadline = calculateDeadline(issue.severity);

  // 5. Create task
  const task = await prisma.task.create({
    data: {
      issueId: issue.id,
      officialId: assignedOfficial.id,
      status: "assigned",
      deadline,
    },
  });

  // Update Report
  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      status: "assigned",
      authorityId: assignedOfficial.id,
      deadline,
    },
  });

  // 7. Update official's workload
  await prisma.authority.update({
    where: { id: assignedOfficial.id },
    data: {
      currentTasks: {
        increment: 1,
      },
    },
  });

  console.log("Assignment complete:", assignedOfficial.name);

  return {
    taskId: task.id,
    assignedOfficialId: assignedOfficial.id,
    officialName: assignedOfficial.name,
    deadline: deadline,
  };
}

async function findEligibleOfficials(
  category: string,
  lat: number,
  lng: number,
  severity: string
) {
  // 1. Find by category (service type)
  const officialsByCategory = await prisma.authority.findMany({
    where: {
      serviceCategory: category,
      status: "active",
    },
  });

  // 2. Filter by jurisdiction (location mock - checking bounding box for demo)
  const eligibleByLocation = officialsByCategory.filter((official) => {
    if (!official.jurisdictionBoundary) return true; // fallback
    try {
      const boundary = JSON.parse(official.jurisdictionBoundary);
      return (
        lat >= boundary.south &&
        lat <= boundary.north &&
        lng >= boundary.west &&
        lng <= boundary.east
      );
    } catch {
      return true; // if unparseable, skip bounds check
    }
  });

  // 3. Filter by capacity (not overloaded)
  const maxTasksPerOfficial = severity === "critical" ? 5 : 10;
  const availableOfficials = eligibleByLocation.filter((official) => {
    return official.currentTasks < maxTasksPerOfficial;
  });

  return availableOfficials;
}

function rankOfficialsByPerformance(officials: Authority[]) {
  return officials.sort((a, b) => {
    // Score = Points + Rating - Workload
    const ratingA = a.averageRating || 0;
    const ratingB = b.averageRating || 0;

    const scoreA = a.totalPoints * 0.6 + ratingA * 20 - a.currentTasks * 5;
    const scoreB = b.totalPoints * 0.6 + ratingB * 20 - b.currentTasks * 5;

    return scoreB - scoreA; // Higher score first
  });
}

function calculateDeadline(severity: string) {
  const now = new Date();
  switch (severity) {
    case "critical":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case "major":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    case "minor":
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
}

/**
 * PHASE 2: Official starts work
 */
export async function startTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  if (task.status !== "assigned") throw new Error("Task not in assigned status");

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "in_progress",
      startedAt: new Date(),
    },
  });

  await prisma.issue.update({
    where: { id: task.issueId },
    data: { status: "in_progress" },
  });

  return updatedTask;
}

/**
 * PHASE 3: Official completes work and submits
 */
export async function submitWork(
  taskId: string,
  afterPhotoUrl: string,
  notes: string,
  lat: number,
  lng: number
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");
  if (task.status !== "in_progress") throw new Error("Task not in progress");

  const now = new Date();
  
  // Calculate points for automated approval
  let points = 10; // Base completion points
  if (now <= task.deadline) {
    points += 5; // Bonus for early/on-time completion
  }

  // 1. Finalize the Task
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "approved", // Auto-approved for demo
      afterPhotoUrl,
      afterPhotoLat: lat,
      afterPhotoLng: lng,
      afterPhotoTime: now,
      workNotes: notes,
      submittedAt: now,
      completedAt: now,
      pointsEarned: points,
    },
  });

  // 2. Resolve the Issue
  await prisma.issue.update({
    where: { id: task.issueId },
    data: {
      status: "resolved",
      submittedAt: now,
      resolvedAt: now,
    },
  });

  // 3. Update Official Balance & Stats
  await prisma.authority.update({
    where: { id: task.officialId },
    data: {
      totalPoints: { increment: points },
      completedTasks: { increment: 1 },
      currentTasks: { decrement: 1 },
    }
  });

  return updatedTask;
}

/**
 * PHASE 4: Verification
 */
export async function verifyWork(
  taskId: string,
  decision: "approve" | "reject",
  reason: string
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  if (decision === "approve") {
    const points = calculatePoints(task);
    
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "approved",
        pointsEarned: points,
        pointsBasis: JSON.stringify({ reason, bonus: points }),
      },
    });

    await prisma.issue.update({
      where: { id: task.issueId },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    });

    await prisma.authority.update({
      where: { id: task.officialId },
      data: {
        totalPoints: { increment: points },
        completedTasks: { increment: 1 },
        currentTasks: { decrement: 1 },
      },
    });
  } else if (decision === "reject") {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "rejected",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  return true;
}

function calculatePoints(task: Task) {
  let points = 0;
  if (!task.submittedAt) return 0;

  // On-time check
  if (task.submittedAt <= task.deadline) {
    points += 10;
  } else {
    const hoursLate =
      (task.submittedAt.getTime() - task.deadline.getTime()) / (1000 * 60 * 60);
    if (hoursLate <= 24) points += 5;
    else points -= 5;
  }

  return points;
}
