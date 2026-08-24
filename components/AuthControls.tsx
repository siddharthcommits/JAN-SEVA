"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AuthControls() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <span className="text-sm">
          {session.user?.name || session.user?.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3 py-1 bg-red-600 rounded text-sm"
        >
          Sign out
        </button>
      </>
    );
  }

  return <Link href="/auth/login">Sign in</Link>;
}
