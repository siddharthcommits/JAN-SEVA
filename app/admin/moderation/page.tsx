import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import AdminModerationClient from "@/components/AdminModerationClient";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const adminList = process.env.ADMIN_EMAILS || "";
  const admins = adminList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (
    !session ||
    !session.user ||
    !admins.includes((session.user.email || "").toString())
  ) {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-xl font-semibold">Not authorized</h2>
        <p className="mt-2 text-sm text-muted">
          You must be an administrator to access this page.
        </p>
      </div>
    );
  }

  return <AdminModerationClient />;
}
