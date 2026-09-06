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
    <div className="leaf rounded-[20px] p-5">
      <label htmlFor="wall-body" className="sr-only">
        پیام برای دیوار
      </label>
      <textarea
        id="wall-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="چیزی برای ما بنویس..."
        className="w-full resize-none rounded-xl border border-gold-pale bg-sunk/40 p-4 text-sm outline-none placeholder:text-muted/60 focus:border-olive"
      />

      {preview && (
        <div className="relative mt-3">
          <img
            src={preview}
            alt="پیش‌نمایش عکس انتخاب‌شده"
            className="w-full rounded-2xl border border-gold-pale"
          />
          <button
            onClick={clearImage}
            aria-label="حذف عکس"
            className="absolute end-3 top-3 h-8 w-8 rounded-full bg-ink/75 text-lg leading-none text-paper backdrop-blur-sm"
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
          className="rounded-xl border border-gold-pale px-4 py-3 text-sm text-gold-ink transition hover:bg-sunk"
        >
          عکس
        </button>
        <button
          disabled={busy || (!body.trim() && !blob)}
          onClick={submit}
          className="flex-1 rounded-xl bg-olive py-3 text-sm font-medium text-paper transition hover:bg-olive-deep disabled:opacity-40"
        >
          {busy ? "..." : "بفرست"}
        </button>
      </div>

      {msg && (
        <p role="status" className="mt-3 text-center text-sm text-gold-ink">
          {msg}
        </p>
      )}
    </div>
  );
}