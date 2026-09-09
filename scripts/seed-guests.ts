import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { normalizePhone } from "../lib/phone";
import { makeToken } from "../lib/token";
import { wedding } from "../content/config";

const DRY = process.argv.includes("--dry");

/**
 * Where the links point. Override for a run with SITE=..., which is the whole
 * story if the invitation ever moves: the tokens do not change, only the
 * hostname in front of them, so re-running against a different SITE reissues
 * every guest's link to the new address without invalidating anything.
 */
const SITE = (process.env.SITE ?? "https://wedding-seven-bay.vercel.app").replace(
  /\/+$/,
  ""
);

type Row = {
  name: string;
  phone: string;
  display_name: string | null;
  host: boolean;
  token: string;
};

/**
 * `name,phone,display_name` — the third column optional.
 *
 * `name` is the greeting on the envelope and is printed exactly as written,
 * endearments and all: «خاله عزیز». `display_name` is what sits above their
 * messages on the wall, where an endearment addressed *to* them reads as
 * nonsense coming *from* them — so that column holds the plain name. Left
 * empty, the wall falls back to `name`.
 */
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
    const phone = normalizePhone(parts[1] ?? "");
    const display = (parts[2] ?? "").trim();

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
    rows.push({
      name,
      phone,
      display_name: display || null,
      host: (wedding.hosts as readonly string[]).includes(phone),
      token: makeToken(),
    });
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
  console.log(`  links will point at ${SITE}`);

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

  // Fail loudly and usefully rather than 61 times with a PostgREST error.
  const { error: shape } = await supabase
    .from("guests")
    .select("display_name, host")
    .limit(1);
  if (shape) {
    console.error(
      "\n✗ The guests table is missing display_name / host.\n" +
        "  Run supabase/migrations/0001_display_name_hosts_and_lockdown.sql\n" +
        "  in the Supabase dashboard (SQL Editor), then try again.\n"
    );
    process.exit(1);
  }

  let added = 0;
  let updated = 0;
  const out: string[] = ["name,phone,display_name,link"];

  for (const r of rows) {
    const { data: existing } = await supabase
      .from("guests")
      .select("token, name, display_name, host")
      .eq("phone", r.phone)
      .maybeSingle();

    if (existing) {
      // The token is never reissued — links already sent have to keep working.
      // Everything else follows the CSV, or editing a name in the file after
      // the first run would silently do nothing.
      const changed =
        existing.name !== r.name ||
        (existing.display_name ?? null) !== r.display_name ||
        Boolean(existing.host) !== r.host;

      if (changed) {
        const { error } = await supabase
          .from("guests")
          .update({ name: r.name, display_name: r.display_name, host: r.host })
          .eq("phone", r.phone);
        if (error) console.error(`   ✗ ${r.name}: ${error.message}`);
        else updated++;
      }

      out.push(
        `${r.name},${r.phone},${r.display_name ?? ""},${SITE}/i/${existing.token}`
      );
      continue;
    }

    const { error } = await supabase.from("guests").insert(r);
    if (error) {
      console.error(`   ✗ ${r.name}: ${error.message}`);
      continue;
    }
    added++;
    out.push(`${r.name},${r.phone},${r.display_name ?? ""},${SITE}/i/${r.token}`);
  }

  fs.writeFileSync("guest-links.csv", out.join("\n"), "utf8");
  console.log(`\n✓ ${added} new guests added, ${updated} updated`);
  console.log(`✓ guest-links.csv written (${out.length - 1} rows)\n`);
  console.log(
    `  hosts (can delete anything on the wall): ${rows.filter((r) => r.host).length}`
  );
}

main();