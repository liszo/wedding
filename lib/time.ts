import { toFa } from "./fa";

export function agoFa(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "همین حالا";
  const m = Math.floor(s / 60);
  if (m < 60) return `${toFa(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toFa(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${toFa(d)} روز پیش`;
  return `${toFa(Math.floor(d / 30))} ماه پیش`;
}