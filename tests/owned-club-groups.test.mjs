import assert from "node:assert/strict";
import { test } from "node:test";
import clubs from "../public/clubs.json" with { type: "json" };
import {
  groupClubsForOwnedPicker,
  OWNED_PICKER_LEAGUES,
  pickerGroupIdForClub,
} from "../lib/owned-club-groups.js";

test("every club maps to a known picker group", () => {
  const ids = new Set(OWNED_PICKER_LEAGUES.map((l) => l.id));
  for (const club of clubs) {
    const id = pickerGroupIdForClub(club);
    assert.ok(ids.has(id), `${club.slug} → ${id}`);
  }
});

test("grouped picker includes all clubs exactly once", () => {
  const groups = groupClubsForOwnedPicker(clubs);
  const slugs = groups.flatMap((g) => g.clubs.map((c) => c.slug));
  assert.equal(slugs.length, clubs.length);
  assert.equal(new Set(slugs).size, clubs.length);
});

test("Premier League section includes Arsenal and no club is first in UI separately", () => {
  const groups = groupClubsForOwnedPicker(clubs);
  const pl = groups.find((g) => g.id === "premier-league");
  assert.ok(pl);
  assert.ok(pl.clubs.some((c) => c.slug === "arsenal"));
});

test("sections follow league importance order", () => {
  const groups = groupClubsForOwnedPicker(clubs);
  const order = OWNED_PICKER_LEAGUES.map((l) => l.id);
  let last = -1;
  for (const g of groups) {
    const idx = order.indexOf(g.id);
    assert.ok(idx > last, `section ${g.id} out of order`);
    last = idx;
  }
});
