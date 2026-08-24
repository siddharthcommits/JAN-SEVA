"use client";

import React, { useEffect, useState } from "react";

type FlagRow = {
  flag: {
    id: string;
    commentId: string;
    userId: string;
    reason?: string;
    createdAt: string;
  };
  comment: {
    id: string;
    issueId: string;
    userId: string;
    text: string;
    createdAt: string;
  } | null;
};

export default function AdminModerationClient() {
  const [rows, setRows] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    setLoading(true);
    try {
      const res = await fetch("/api/moderation/flags");
      const j = await res.json();
      setRows(j.flags || []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(commentId: string, flagId: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      await fetch(`/api/moderation/comments/${commentId}`, {
        method: "DELETE",
      });
      // remove from UI
      setRows((r) => r.filter((row) => row.flag.id !== flagId));
    } catch (err) {
      console.error(err);
    }
  }

  async function dismissFlag(flagId: string) {
    try {
      await fetch(`/api/moderation/flags/${flagId}`, { method: "DELETE" });
      setRows((r) => r.filter((row) => row.flag.id !== flagId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Moderation — Flagged Comments
      </h2>
      {loading && <div className="text-muted">Loading…</div>}
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.flag.id} className="bg-white border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-muted">
                  Flagged by: {r.flag.userId} —{" "}
                  {new Date(r.flag.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 text-sm">
                  Reason: {r.flag.reason || "—"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dismissFlag(r.flag.id)}
                  className="px-3 py-1 border rounded"
                >
                  Dismiss
                </button>
                {r.comment && (
                  <button
                    onClick={() => deleteComment(r.comment!.id, r.flag.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete Comment
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium">Comment</div>
              <div className="mt-2 text-sm text-muted">
                {r.comment ? r.comment.text : "Comment not found"}
              </div>
              {r.comment && (
                <div className="mt-2 text-xs text-muted">
                  Issue:{" "}
                  <a
                    className="text-saffron"
                    href={`/reports/${r.comment.issueId}`}
                  >
                    {r.comment.issueId}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {rows.length === 0 && !loading && (
          <div className="text-muted">No flagged comments</div>
        )}
      </div>
    </div>
  );
}
