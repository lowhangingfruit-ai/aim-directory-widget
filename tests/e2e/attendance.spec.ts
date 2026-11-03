import { expect, test } from "@playwright/test";
import { mergeHistory, snapshotFromFeed } from "../../lib/attendance";
import type { Vendor } from "../../lib/types";

// The saving rules for past market days, without storage.

const vendor = (vendorID: number, marketID: number, dates: string[]) =>
  ({ vendorID, markets: [{ marketID, market: "", dates }] }) as unknown as Vendor;

test("a snapshot keeps only upcoming dates at AIM markets", () => {
  const snap = snapshotFromFeed([
    vendor(1, 7776, ["11/1/2026", "11/8/2026"]),
    vendor(2, 7776, ["11/8/2026"]),
    vendor(3, 9999, ["11/8/2026"]),
  ], "2026-11-03");
  expect(snap).toEqual({ 7776: { "2026-11-08": [1, 2] } });
});

test("past dates are never changed, upcoming ones take the newest list, old ones drop off", () => {
  const stored = {
    7776: { "2026-09-01": [9], "2026-11-01": [1, 2], "2026-11-08": [1] },
  };
  const snapshot = { 7776: { "2026-11-08": [2, 1, 1], "2026-11-15": [3] } };
  const merged = mergeHistory(stored, snapshot, "2026-11-03");
  expect(merged).toEqual({ 7776: { "2026-11-01": [1, 2], "2026-11-08": [1, 2], "2026-11-15": [3] } });
  // Running again with the same feed gives the same file.
  expect(mergeHistory(merged, snapshot, "2026-11-03")).toEqual(merged);
});

test("a market day that drops out of the feed after it passes is kept", () => {
  const before = mergeHistory({}, { 7785: { "2026-11-07": [5, 6] } }, "2026-11-06");
  const after = mergeHistory(before, {}, "2026-11-08");
  expect(after).toEqual({ 7785: { "2026-11-07": [5, 6] } });
});
