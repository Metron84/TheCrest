/**
 * Reads crest_clubs from Supabase (service role) and writes public/clubs.json.
 * Run manually when the database changes. Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=
 */
import { config } from "dotenv";
import { writeFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: join(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SELECT =
  'slug,name,city,country,cluster,tier,competition,vector,confidence,identity_summary,exclusion_clubs,badge_url,archetype,uae,trf_film_youtube_id,research_status,primary,secondary,stadium_name,skyline_variant';

const { data, error } = await supabase
  .from("crest_clubs")
  .select(SELECT)
  .order("name");

if (error) {
  console.error("Supabase error:", error.message);
  process.exit(1);
}

if (!data?.length) {
  console.error("No rows returned from crest_clubs.");
  process.exit(1);
}

const dest = join(process.cwd(), "public/clubs.json");
const clubs = data.map((row) => {
  const { stadium_name, skyline_variant, ...rest } = row;
  return {
    ...rest,
    stadiumName: stadium_name ?? null,
    skylineVariant: skyline_variant ?? null,
  };
});
writeFileSync(dest, `${JSON.stringify(clubs, null, 2)}\n`);
console.log(`Snapshot: ${clubs.length} clubs → ${dest}`);
console.log("Run: node scripts/enrich-club-ground.mjs if ground fields need presets.");
