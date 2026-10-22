import { unstable_cache } from "next/cache";
import { readRows, scriptConfig } from "./sheetScript";
import { buildAnswers, EMPTY_ANSWERS, IntakeAnswers } from "./intakeRows";

export type { IntakeAnswers };

// Reads the intake Sheet for the directory. Reads go through the
// Apps Script, are cached for 10 minutes, and are refreshed right after a new
// submission (see /api/intake). AIM staff can correct a row in the Sheet, or
// set "Agreed to show in directory" to No to hide it.

export const INTAKE_ANSWERS_TAG = "intake-answers";

const cachedRead = unstable_cache(
  async () => {
    const cfg = scriptConfig();
    if (!cfg) return EMPTY_ANSWERS;
    return buildAnswers(await readRows(cfg));
  },
  ["intake-answers-v1"],
  { revalidate: 600, tags: [INTAKE_ANSWERS_TAG] }
);

// If the Sheet can't be read, the directory still loads, just without these
// answers. Errors are not cached, so the next request tries again.
export async function getIntakeAnswers(): Promise<IntakeAnswers> {
  try {
    return await cachedRead();
  } catch (err) {
    console.error(`[intake-answers] read failed: ${err instanceof Error ? err.message : "unknown error"}`);
    return EMPTY_ANSWERS;
  }
}
