import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontsDir = join(root, "public/fonts");

const copies = [
  {
    from: "@fontsource/bodoni-moda/files/bodoni-moda-latin-400-normal.woff2",
    to: "bodoni-latin-400-normal.woff2",
    face: `font-family: 'Bodoni Moda'; font-style: normal; font-weight: 400;`,
  },
  {
    from: "@fontsource/bodoni-moda/files/bodoni-moda-latin-600-italic.woff2",
    to: "bodoni-latin-600-italic.woff2",
    face: `font-family: 'Bodoni Moda'; font-style: italic; font-weight: 600;`,
  },
  {
    from: "@fontsource/archivo/files/archivo-latin-400-normal.woff2",
    to: "archivo-latin-400-normal.woff2",
    face: `font-family: 'Archivo'; font-style: normal; font-weight: 400;`,
  },
  {
    from: "@fontsource/archivo/files/archivo-latin-500-normal.woff2",
    to: "archivo-latin-500-normal.woff2",
    face: `font-family: 'Archivo'; font-style: normal; font-weight: 500;`,
  },
  {
    from: "@fontsource/archivo/files/archivo-latin-600-normal.woff2",
    to: "archivo-latin-600-normal.woff2",
    face: `font-family: 'Archivo'; font-style: normal; font-weight: 600;`,
  },
];

if (!existsSync(join(root, "node_modules"))) {
  process.exit(0);
}

mkdirSync(fontsDir, { recursive: true });

const cssLines = copies.map(({ from, to, face }) => {
  const src = join(root, "node_modules", from);
  if (!existsSync(src)) {
    console.warn("Font file missing (run npm install):", from);
    return "";
  }
  copyFileSync(src, join(fontsDir, to));
  return `@font-face { ${face} font-display: swap; src: url('/fonts/${to}') format('woff2'); }`;
});

writeFileSync(join(fontsDir, "fonts.css"), `${cssLines.filter(Boolean).join("\n")}\n`);
