import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { normalizePhone } from "../lib/phone";
import { makeToken } from "../lib/token";

const DRY = process.argv.includes("--dry");
const SITE = "https://wedding.yekjapack.com";

type Row = { name: string; phone: string; token: string };

function parseCsv(file: string): Row[] {
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

  const seen = new Set<string>();
  const rows: Row[] = [];
  const skipped: string[] = [];

  for (const [i, line] of lines.entries()) {
    const parts = line.split(",");
    if (parts.length < 2) continue;
    const name = parts[0].trim();
    const phone = normalizePhone(parts.slice(1).join(","));

    if (i === 0 && !/^\d/.test(phone.slice(1))) continue;
    if (!name || phone.length !== 11 || !phone.startsWith("09")) {
      skipped.push(`${line}  → invalid`);
      continue;
    }
    if (seen.has(phone)) {
      skipped.push(`${line}  → duplicate of ${phone}`);
      continue;
    }
    seen.add(phone);
    rows.push({ name, phone, token: makeToken() });
  }

  if (skipped.length) {
    console.log("\n⚠  Skipped rows:");
    skipped.forEach((s) => console.log("   " + s));
  }
  return rows;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npx tsx scripts/seed-guests.ts guests.csv [--dry]");
    process.exit(1);
  }

  const rows = parseCsv(path.resolve(file));
  console.log(`\n✓ ${rows.length} valid guests parsed`);

  if (DRY) {
    console.log("\nDRY RUN — nothing written to the database.\n");
    rows.slice(0, 3).forEach((r) =>
      console.log(`   ${r.name}  ${r.phone}  ${SITE}/i/${r.token}`)
    );
    return;
  }

  process.loadEnvFile(".env.local");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  let added = 0;
  const out: string[] = ["name,phone,link"];

  for (const r of rows) {
    const { data: existing } = await supabase
      .from("guests")
      .select("token")
      .eq("phone", r.phone)
      .maybeSingle();

    if (existing) {
      out.push(`${r.name},${r.phone},${SITE}/i/${existing.token}`);
      continue;
    }

    const { error } = await supabase.from("guests").insert(r);
    if (error) {
      console.error(`   ✗ ${r.name}: ${error.message}`);
      continue;
    }
    added++;
    out.push(`${r.name},${r.phone},${SITE}/i/${r.token}`);
  }

  fs.writeFileSync("guest-links.csv", out.join("\n"), "utf8");
  console.log(`\n✓ ${added} new guests added`);
  console.log(`✓ guest-links.csv written (${out.length - 1} rows)\n`);
}

main();