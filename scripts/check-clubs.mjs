import { existsSync, readFileSync } from "fs";
import { join } from "path";

const path = join(process.cwd(), "public/clubs.json");

if (!existsSync(path)) {
  console.error(
    "\nThe Crest build failed: public/clubs.json is missing.\n" +
      "Run `npm run snapshot` from trf-project Supabase data, or copy the sample:\n" +
      "  node scripts/bootstrap-sample-clubs.mjs\n",
  );
  process.exit(1);
}

try {
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("clubs.json must be a non-empty array");
  }
} catch (err) {
  console.error("\nThe Crest build failed: public/clubs.json is invalid.", err.message);
  process.exit(1);
}
