"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) window.location.reload();
    else setMsg(r.status === 429 ? "تلاش زیاد. کمی صبر کن." : "رمز اشتباه است.");
    setBusy(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-xs rounded-3xl bg-raised/70 p-7 ring-1 ring-candle/10">
        <h1 className="mb-5 text-center text-lg text-candle">ورود مدیر</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mb-3 w-full rounded-xl bg-night/50 px-4 py-3 text-sm ring-1 ring-mist/10 outline-none focus:ring-candle/40"
        />
        {msg && <p className="mb-3 text-sm text-pomegranate">{msg}</p>}
        <button
          disabled={busy}
          onClick={submit}
          className="w-full rounded-xl bg-candle py-3 text-sm font-medium text-night disabled:opacity-50"
        >
          {busy ? "..." : "ورود"}
        </button>
      </div>
    </main>
  );
}