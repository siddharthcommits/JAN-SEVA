import React, { useEffect, useState } from "react";

type Props = {
  id: string;
  title: string;
  category: string;
  photoUrl: string;
  location?: string;
  status?: string;
};

export default function IssueCard({
  id,
  title,
  category,
  photoUrl,
  location,
  status,
}: Props) {
  const [votes, setVotes] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/issues/${id}/meta`)
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setVotes(d.votes || 0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  async function vote(value: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/issues/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: id, userId: "anonymous", value }),
      });
      if (res.ok) {
        setVotes((v) => v + value);
      }
    } catch (err) {
      console.error("vote error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
      <div className="w-full h-48 bg-gray-100">
        <img
          src={photoUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted">{status || "Pending"}</span>
        </div>
        <p className="text-sm text-muted mt-2">
          {category} • {location}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => vote(1)}
            disabled={loading}
            className="px-3 py-1 bg-saffron text-white rounded"
          >
            Upvote
          </button>
          <button
            onClick={() => vote(-1)}
            disabled={loading}
            className="px-3 py-1 border rounded"
          >
            Downvote
          </button>
          <div className="text-sm text-muted">Votes: {votes}</div>
        </div>
      </div>
    </article>
  );
}
