import sharp from "sharp";
import { join } from "path";

const src = join(process.cwd(), "assets/crest-mark.svg");
const outDir = join(process.cwd(), "public/icons");

async function png(size, name, padding = 0.08) {
  const inner = Math.round(size * (1 - padding * 2));
  await sharp(src)
    .resize(inner, inner, { fit: "contain", background: "#F2EDE4" })
    .extend({
      top: Math.round(size * padding),
      bottom: Math.round(size * padding),
      left: Math.round(size * padding),
      right: Math.round(size * padding),
      background: "#F2EDE4",
    })
    .png()
    .toFile(join(outDir, name));
}

await png(192, "icon-192.png");
await png(512, "icon-512.png");
await png(512, "icon-maskable-512.png", 0.22);
await sharp(src)
  .resize(180, 180, { fit: "contain", background: "#F2EDE4" })
  .png()
  .toFile(join(outDir, "apple-touch-icon.png"));

console.log("Icons written to public/icons/");
