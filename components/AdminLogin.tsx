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
      <div className="leaf w-full max-w-xs rounded-[20px] p-7">
        <h1 className="nastaliq mb-5 text-center text-2xl text-gold-deep">
          ورود مدیر
        </h1>
        <label htmlFor="admin-password" className="sr-only">
          رمز مدیر
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mb-3 w-full rounded-xl border border-gold-pale bg-sunk/40 px-4 py-3 text-sm outline-none focus:border-olive"
        />
        {msg && (
          <p role="status" className="mb-3 text-sm text-crimson">
            {msg}
          </p>
        )}
        <button
          disabled={busy}
          onClick={submit}
          className="w-full rounded-xl bg-olive py-3 text-sm font-medium text-paper transition hover:bg-olive-deep disabled:opacity-50"
        >
          {busy ? "..." : "ورود"}
        </button>
      </div>
    </main>
  );
}