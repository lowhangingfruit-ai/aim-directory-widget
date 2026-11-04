import { expect, test } from "@playwright/test";
import { CROPS, cropMatches } from "../../lib/season";

// A crop picked from the in-season guide finds the products vendors list
// under other names, and leaves out products that only share a word with it.

const crop = (name: string) => CROPS.find((c) => c.name === name)!;

test("citrus finds the fruit vendors list by name", () => {
  for (const p of ["Mandarins", "Blood Oranges", "Lemons", "Limes", "Kumquats", "Grapefruit", "Satsumas", "Buddha Hand Citron"]) {
    expect(cropMatches(crop("Citrus"), p), p).toBe(true);
  }
  for (const p of ["Cucumbers - Lemon", "Lemon Verbena", "Lemonade", "Apple Juice"]) {
    expect(cropMatches(crop("Citrus"), p), p).toBe(false);
  }
});

test("cherries leave out cherry tomatoes and ground cherries", () => {
  expect(cropMatches(crop("Cherries"), "Cherries")).toBe(true);
  expect(cropMatches(crop("Cherries"), "Cherry Tomatoes")).toBe(false);
  expect(cropMatches(crop("Cherries"), "Ground Cherries")).toBe(false);
  expect(cropMatches(crop("Tomatoes"), "Cherry Tomatoes")).toBe(true);
});
