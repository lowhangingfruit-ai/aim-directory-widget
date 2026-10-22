import { NextRequest, NextResponse } from "next/server";
import { parseSubmission, SHEET_HEADERS, toSheetRow } from "@/lib/intake";
import { appendRow, scriptConfig } from "@/lib/sheetScript";
import { revalidateTag } from "next/cache";
import { INTAKE_ANSWERS_TAG } from "@/lib/intakeAnswers";

const GENERIC_ERROR = "Something went wrong saving your answers. Please try again in a minute.";

// What happens when a step fails: nothing is written unless validation passes;
// if the Sheet append fails the person sees a generic error with their answers
// still filled in, and can resubmit. The script skips a submission ID it has
// already written, and a fresh submission for the same vendor is harmless
// because the newest row per vendor ID wins.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please fill in the form." }, { status: 400 });
  }

  // Hidden field that people never see; bots tend to fill it in.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website_url) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseSubmission(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const submission = parsed.value;

  const cfg = scriptConfig();
  if (!cfg) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[intake] dry run, Sheet not configured: ${submission.submissionID}`);
      return NextResponse.json({ ok: true, stored: false });
    }
    console.error("[intake] Sheet not configured");
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 503 });
  }

  try {
    await appendRow(cfg, submission.submissionID, SHEET_HEADERS, toSheetRow(submission, new Date()));
  } catch (err) {
    console.error(`[intake] ${submission.submissionID} not saved: ${err instanceof Error ? err.message : "unknown error"}`);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  // The directory picks up the new answer on its next visit instead of
  // waiting out the 10-minute cache.
  revalidateTag(INTAKE_ANSWERS_TAG, "max");

  console.info(`[intake] saved ${submission.submissionID} vendor=${submission.vendorID ?? "unlisted"}`);
  return NextResponse.json({ ok: true, stored: true });
}
