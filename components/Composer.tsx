"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/compress";

export default function Composer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsg("");
    try {
      const out = await compressImage(f);
      setBlob(out);
      setPreview(URL.createObjectURL(out));
    } catch {
      setMsg("این عکس باز نشد. عکس دیگری انتخاب کن.");
    }
  }

  function clearImage() {
    setBlob(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (!body.trim() && !blob) return;
    setBusy(true);
    setMsg("");

    const form = new FormData();
    form.set("body", body);
    if (blob) form.set("image", new File([blob], "photo.jpg", { type: "image/jpeg" }));

    try {
      const r = await fetch("/api/posts", { method: "POST", body: form });
      const j = await r.json();
      setMsg(j.message);
      if (r.ok) {
        setBody("");
        clearImage();
        router.refresh();
      }
    } catch {
      setMsg("خطا در ارتباط. دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl bg-raised/70 p-5 ring-1 ring-candle/10">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="چیزی برای ما بنویس..."
        className="w-full resize-none rounded-xl bg-night/50 p-4 text-sm ring-1 ring-mist/10 outline-none placeholder:text-mist/30 focus:ring-candle/40"
      />

      {preview && (
        <div className="relative mt-3">
          <img src={preview} alt="" className="w-full rounded-2xl ring-1 ring-mist/10" />
          <button
            onClick={clearImage}
            aria-label="حذف عکس"
            className="absolute end-3 top-3 h-8 w-8 rounded-full bg-night/80 text-mist backdrop-blur-sm"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="hidden"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-candle/10 px-4 py-3 text-sm text-candle ring-1 ring-candle/20"
        >
          عکس
        </button>
        <button
          disabled={busy || (!body.trim() && !blob)}
          onClick={submit}
          className="flex-1 rounded-xl bg-candle py-3 text-sm font-medium text-night transition hover:bg-saffron disabled:opacity-40"
        >
          {busy ? "..." : "بفرست"}
        </button>
      </div>

      {msg && <p className="mt-3 text-center text-sm text-candle">{msg}</p>}
    </div>
  );
}