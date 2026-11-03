import { expect, test } from "@playwright/test";
import { fixMojibake } from "../../lib/vendors";

// Vendor text that MMM saved double-encoded is repaired; correct text is left alone.

test("double-encoded punctuation and accents are repaired", () => {
  expect(fixMojibake("Welcome to Meeraâ€™s Sweet Delights")).toBe("Welcome to Meera’s Sweet Delights");
  expect(fixMojibake("CafÃ© and crÃ¨me")).toBe("Café and crème");
  expect(fixMojibake("freshÂ bread")).toBe("fresh bread");
  expect(fixMojibake("ItÃ¢Â\u0080Â\u0099s")).toBe("It’s");
});

test("text that is already right is left alone", () => {
  for (const s of ["Meera’s", "Café", "Ñandú Farm", "Größe", "100% organic — always", "Señor Â la carte"]) {
    expect(fixMojibake(s)).toBe(s);
  }
});
