"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePost({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const r = await fetch("/api/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (r.ok) router.refresh();
    setBusy(false);
  }

  if (!confirming)
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-mist/30 hover:text-pomegranate"
      >
        حذف
      </button>
    );

  return (
    <span className="flex gap-2 text-xs">
      <button
        disabled={busy}
        onClick={remove}
        className="text-pomegranate disabled:opacity-50"
      >
        مطمئنم
      </button>
      <button onClick={() => setConfirming(false)} className="text-mist/40">
        بی‌خیال
      </button>
    </span>
  );
}