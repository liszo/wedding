const FA = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(input: number | string): string {
  return String(input).replace(/\d/g, (d) => FA[Number(d)]);
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}