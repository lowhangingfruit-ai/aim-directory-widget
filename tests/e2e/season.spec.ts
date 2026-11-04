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

test("crops leave out products that only share a word with them", () => {
  const cases: [string, string[], string[]][] = [
    ["Corn", ["Corn", "Corn (Sweet)"], ["Popcorn", "Kettle Corn", "Corn Chips", "Corn Flour"]],
    ["Peas", ["Peas - Snow"], ["Black-Eyed Peas"]],
    ["Potatoes", ["Potatoes - Yukon Gold"], ["Sweet Potatoes"]],
    ["Winter squash", ["Squash- Butternut", "Squash - Delicata"], ["Squash - Summer", "Squash Blossoms"]],
    ["Apples", ["Apples"], ["Apple Butter", "Apple Chips", "Apple Juice"]],
    ["Figs", ["Figs"], ["Trees - Fig"]],
    ["Grapes", ["Grapes"], ["Grapefruit"]],
    ["Melons", ["Melons"], ["Watermelon"]],
    ["Pears", ["Asian Pears", "Pears"], ["Prickley Pear (Fruit)"]],
    ["Raspberries", ["Black Raspberries"], ["Bushes - Raspberry"]],
  ];
  for (const [name, yes, no] of cases) {
    for (const p of yes) expect(cropMatches(crop(name), p), `${name}: ${p}`).toBe(true);
    for (const p of no) expect(cropMatches(crop(name), p), `${name}: ${p}`).toBe(false);
  }
});

test("a description that mentions the crop and a lookalike still matches", () => {
  expect(cropMatches(crop("Cherries"), "We grow cherries and cherry tomatoes")).toBe(true);
  expect(cropMatches(crop("Figs"), "Fresh figs, and fig trees for your garden")).toBe(true);
  expect(cropMatches(crop("Figs"), "Fig trees for your garden")).toBe(false);
});
