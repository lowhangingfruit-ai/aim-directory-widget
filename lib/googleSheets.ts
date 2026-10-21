import { createSign } from "node:crypto";

// Appends rows to a Google Sheet with a service account, without the
// googleapis SDK. The Sheet must be shared (Editor) with the service
// account's email address.
//
// Env:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_KEY   PEM private key; "\n" escapes are accepted
//   INTAKE_SHEET_ID              the ID from the Sheet's URL
//   INTAKE_SHEET_TAB             optional, defaults to "Responses"

interface SheetConfig {
  email: string;
  key: string;
  sheetID: string;
  tab: string;
}

export function sheetConfig(): SheetConfig | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const sheetID = process.env.INTAKE_SHEET_ID;
  if (!email || !key || !sheetID) return null;
  return { email, key: key.replace(/\\n/g, "\n"), sheetID, tab: process.env.INTAKE_SHEET_TAB || "Responses" };
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(cfg: SheetConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: cfg.email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${base64url(signer.sign(cfg.key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("token response had no access_token");
  return data.access_token;
}

// RAW input keeps every value a literal string, so text that starts with "="
// is never evaluated as a formula.
export async function appendRow(cfg: SheetConfig, row: string[]): Promise<void> {
  const token = await accessToken(cfg);
  const range = encodeURIComponent(`${cfg.tab}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) throw new Error(`append failed: ${res.status}`);
}
