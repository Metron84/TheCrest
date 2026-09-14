/**
 * Write an explicit character record for every club.
 * Poles only from identity_summary or the locked say/do notes.
 * Civic / thin sides stay 4 / confidence 1.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clubs = JSON.parse(readFileSync(join(root, "public/clubs.json"), "utf8"));

const FLAT_VALUES = { integrity: 4, decency: 4, respect: 4, power: 4 };
const FLAT_CONF = { integrity: 1, decency: 1, respect: 1, power: 1 };

/** Sourced poles only. Partial objects merge onto 4 / 1. */
const POLES = {
  everton: {
    values: { decency: 2 },
    confidence: { decency: 3 },
  },
  "real-madrid": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "st-pauli": {
    values: { integrity: 6, respect: 6, power: 7 },
    confidence: { integrity: 2, respect: 2, power: 3 },
  },
  "afc-wimbledon": {
    values: { integrity: 6, power: 6 },
    confidence: { integrity: 2, power: 2 },
  },
  alaves: {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  arsenal: {
    values: { integrity: 6 },
    confidence: { integrity: 2 },
  },
  "athletic-bilbao": {
    values: { integrity: 6, decency: 2, power: 6 },
    confidence: { integrity: 2, decency: 3, power: 2 },
  },
  barcelona: {
    values: { integrity: 3 },
    confidence: { integrity: 2 },
  },
  "bayern-munich": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "crystal-palace": {
    values: { integrity: 5, power: 6 },
    confidence: { integrity: 2, power: 2 },
  },
  "hull-city": {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  "coventry-city": {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  valencia: {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  "rc-strasbourg": {
    values: { integrity: 5, power: 6 },
    confidence: { integrity: 2, power: 2 },
  },
  fulham: {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  "nottingham-forest": {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  chelsea: {
    values: { integrity: 2 },
    confidence: { integrity: 2 },
  },
  liverpool: {
    values: { integrity: 5, power: 5 },
    confidence: { integrity: 2, power: 2 },
  },
  "manchester-united": {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  "manchester-city": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "newcastle-united": {
    values: { power: 3 },
    confidence: { power: 2 },
  },
  "sc-freiburg": {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  "mainz-05": {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  bologna: {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  fiorentina: {
    values: { integrity: 5, power: 5 },
    confidence: { integrity: 2, power: 2 },
  },
  juventus: {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "ac-milan": {
    values: { integrity: 2 },
    confidence: { integrity: 2 },
  },
  "al-hilal": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "paris-saint-germain": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "girona-fc": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "rb-leipzig": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "tsg-hoffenheim": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "vfl-wolfsburg": {
    values: { integrity: 2, power: 2 },
    confidence: { integrity: 2, power: 2 },
  },
  "as-monaco": {
    values: { integrity: 2 },
    confidence: { integrity: 2 },
  },
  osasuna: {
    values: { integrity: 5, power: 5 },
    confidence: { integrity: 2, power: 2 },
  },
  "red-star-fc": {
    values: { integrity: 6, power: 6 },
    confidence: { integrity: 2, power: 2 },
  },
  millwall: {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  marseille: {
    values: { power: 6 },
    confidence: { power: 2 },
  },
  napoli: {
    values: { power: 5 },
    confidence: { power: 2 },
  },
  roma: {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
  "real-betis": {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
  "union-berlin": {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
  sunderland: {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
  "schalke-04": {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
  "dynamo-dresden": {
    values: { decency: 2 },
    confidence: { decency: 2 },
  },
};

const table = {};
for (const club of clubs) {
  const pole = POLES[club.slug] ?? {};
  table[club.slug] = {
    values: { ...FLAT_VALUES, ...pole.values },
    confidence: { ...FLAT_CONF, ...pole.confidence },
  };
}

const unknown = Object.keys(POLES).filter((slug) => !table[slug]);
if (unknown.length) {
  throw new Error(`Unknown character slugs: ${unknown.join(", ")}`);
}

const dest = join(root, "lib/club-character-table.js");
writeFileSync(
  dest,
  `/** Generated by scripts/build-club-character.mjs. Every live slug has a row. */\nexport default ${JSON.stringify(table, null, 2)};\n`,
);

const poled = Object.keys(POLES).length;
const flat = clubs.length - poled;
process.stdout.write(
  `Wrote ${clubs.length} clubs (${poled} sourced poles, ${flat} flat 4/1) to lib/club-character-table.js\n`,
);
