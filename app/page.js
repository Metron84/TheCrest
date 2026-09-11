import { readFileSync } from "fs";
import { join } from "path";
import CrestApp from "@/components/crest/CrestApp";
import shell from "./page.module.css";

function loadClubs() {
  const path = join(process.cwd(), "public/clubs.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw);
}

export default function Home() {
  const clubs = loadClubs();
  return (
    <main className={shell.main}>
      <CrestApp clubs={clubs} />
    </main>
  );
}
