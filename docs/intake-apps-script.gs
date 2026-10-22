// AIM Market Participant Directory: intake form receiver.
//
// Paste this into the response Sheet under Extensions > Apps Script, then
// follow the setup steps in the README. It accepts requests only from the
// directory site (checked with a shared secret). It does two things:
//   - "append": adds a submission as a new row on the "Responses" tab
//   - "read":   returns the public columns only, so the directory can show
//               categories, payment types and location. Names and emails
//               never leave the Sheet.
// It stores nothing anywhere else.

const TAB = 'Responses';

// The only columns the directory may read. Contact name, contact email and
// notes stay in the Sheet for AIM staff.
const PUBLIC_COLUMNS = [
  'Submitted at',
  'MMM vendor ID',
  'AIM categories',
  'Mainly sells',
  'Payment types',
  'Other payment',
  'Grows or makes in',
  'Agreed to show in directory',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('INTAKE_SECRET');
    if (!secret || body.secret !== secret) return reply_({ ok: false, error: 'unauthorized' });
    if (body.action === 'read') return reply_({ ok: true, rows: readPublic_() });
    return append_(body);
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'script error' });
  }
}

function append_(body) {
  if (typeof body.submissionID !== 'string' || !Array.isArray(body.headers) || !Array.isArray(body.row)) {
    return reply_({ ok: false, error: 'bad request' });
  }
  // One write at a time, so two vendors submitting together can't collide.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(body.headers.map(clean_));
      sheet.setFrozenRows(1);
    }
    // Column B holds the submission ID. A retry of the same submission is skipped.
    const seen = sheet.getRange('B:B').createTextFinder(body.submissionID).matchEntireCell(true).findNext();
    if (!seen) sheet.appendRow(body.row.map(clean_));
  } finally {
    lock.releaseLock();
  }
  return reply_({ ok: true });
}

// Rows as objects keyed by header, public columns only. Columns are found by
// header name, so AIM staff can reorder or add columns without breaking it.
function readPublic_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function (h) { return String(h).trim(); });
  const wanted = PUBLIC_COLUMNS
    .map(function (name) { return { name: name, index: headers.indexOf(name) }; })
    .filter(function (c) { return c.index >= 0; });
  return values.slice(1).map(function (r) {
    const out = {};
    wanted.forEach(function (c) { out[c.name] = text_(r[c.index]); });
    return out;
  });
}

// Sheets turns typed-in dates and numbers into real values; send them back as text.
function text_(v) {
  if (v instanceof Date) return v.toISOString();
  return v == null ? '' : String(v);
}

// Text starting with = + - or @ would otherwise be read as a formula.
function clean_(value) {
  const s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
