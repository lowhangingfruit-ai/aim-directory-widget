// AIM Market Participant Directory: intake form receiver.
//
// Paste this into the response Sheet under Extensions > Apps Script, then
// follow the setup steps in the README. It accepts rows only from the
// directory site (checked with a shared secret) and appends them to the
// "Responses" tab. It stores nothing anywhere else.

const TAB = 'Responses';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('INTAKE_SECRET');
    if (!secret || body.secret !== secret) return reply_({ ok: false, error: 'unauthorized' });
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
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'script error' });
  }
}

// Text starting with = + - or @ would otherwise be read as a formula.
function clean_(value) {
  const s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
