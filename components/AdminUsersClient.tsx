"use client";

import React, { useState } from "react";

type User = { id: string; fullName: string; email: string; role: string };

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [list, setList] = useState<User[]>(users);

  async function setRole(userId: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const j = await res.json();
        setList((l) =>
          l.map((u) => (u.id === userId ? { ...u, role: j.user.role } : u)),
        );
      } else {
        alert("Failed to update role");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <div className="bg-white border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.fullName}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setRole(u.id, "USER")}
                      className="px-2 py-1 border rounded"
                    >
                      User
                    </button>
                    <button
                      onClick={() => setRole(u.id, "AUTHORITY")}
                      className="px-2 py-1 border rounded"
                    >
                      Authority
                    </button>
                    <button
                      onClick={() => setRole(u.id, "ADMIN")}
                      className="px-2 py-1 bg-saffron text-white rounded"
                    >
                      Admin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
