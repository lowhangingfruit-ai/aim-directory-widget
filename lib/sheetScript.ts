// Sends intake rows to a Google Apps Script web app bound to AIM's response
// Sheet (see docs/intake-apps-script.gs). The browser never talks to the
// script; only this server does, with a shared secret, so the script URL and
// secret stay out of the page.
//
// Env:
//   INTAKE_SCRIPT_URL     the web app's /exec URL
//   INTAKE_SCRIPT_SECRET  matches the INTAKE_SECRET script property

interface ScriptConfig {
  url: string;
  secret: string;
}

export function scriptConfig(): ScriptConfig | null {
  const url = process.env.INTAKE_SCRIPT_URL;
  const secret = process.env.INTAKE_SCRIPT_SECRET;
  if (!url || !secret) return null;
  return { url, secret };
}

// Apps Script always answers 200 and redirects to the result, so success is
// read from the JSON body rather than the status code.
export async function appendRow(
  cfg: ScriptConfig,
  submissionID: string,
  headers: string[],
  row: string[]
): Promise<void> {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: cfg.secret, submissionID, headers, row }),
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`script responded ${res.status}`);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!data?.ok) throw new Error(`script rejected row: ${data?.error ?? "no JSON body"}`);
}
