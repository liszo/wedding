export function normalizePhone(raw: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  let s = raw
    .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)))
    .replace(/\D/g, "");
  if (s.startsWith("98")) s = s.slice(2);
  if (s.startsWith("0")) s = s.slice(1);
  return "0" + s;
}