"use client";

import React, { useEffect, useState } from "react";

type Comment = { id: string; userId: string; text: string; createdAt: string };

export default function CommentsSection({ issueId }: { issueId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/issues/${issueId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => setComments([]));
  }, [issueId]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous", text }),
      });
      if (res.ok) {
        const j = await res.json();
        setComments((c) => [j.comment, ...c]);
        setText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold">Community Comments</h3>
      <form onSubmit={postComment} className="mt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />
        <div className="mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-saffron text-white rounded"
          >
            Post Comment
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="bg-white border rounded p-3">
            <div className="text-sm font-medium">{c.userId}</div>
            <div className="text-sm text-muted mt-1">{c.text}</div>
            <div className="text-xs text-muted mt-2">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-muted">No comments yet.</div>
        )}
      </div>
    </div>
  );
}
