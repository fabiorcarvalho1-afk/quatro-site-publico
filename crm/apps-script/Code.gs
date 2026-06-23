// Quatro Folhas - CRM v1 (Google Sheets)
// Endpoint: Web App (doPost)
//
// Data captured (LGPD):
// - whatsapp (digits)
// - consent (boolean)
// - ts (ISO string)
// - page (URL)
// - userAgent (string)
//
// Setup:
// 1) Create a Google Sheet (ex: "Leads Quatro Folhas").
// 2) Extensions -> Apps Script
// 3) Paste this file as Code.gs
// 4) Option A (recommended): Bind to the spreadsheet (default).
//    Option B: Set SPREADSHEET_ID below.
//
// Deploy:
// Deploy -> New deployment -> Web app
// Execute as: Me
// Who has access: Anyone
//
// NOTE: We intentionally return simple JSON and rely on the website using
// navigator.sendBeacon (no-cors) to avoid CORS issues.

const SHEET_NAME = "leads";

// Optional: If the script is NOT bound to the spreadsheet, set the ID here.
// const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";

function doPost(e) {
  try {
    const payload = parsePayload_(e);

    if (!payload || !payload.whatsapp || !payload.consent) {
      return json_(400, { ok: false, error: "invalid_payload" });
    }

    const ss = getSpreadsheet_();
    const sheet = getOrCreateSheet_(ss);

    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      String(payload.whatsapp),
      String(payload.page || ""),
      String(payload.userAgent || ""),
      String(payload.ts || "")
    ]);

    return json_(200, { ok: true });
  } catch (err) {
    return json_(500, { ok: false, error: String(err) });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData) return null;
  const raw = e.postData.contents || "";
  if (!raw) return null;
  const data = JSON.parse(raw);

  const normalizePhone = (value) => String(value || "").replace(/[^\d]+/g, "");

  return {
    whatsapp: normalizePhone(data.whatsapp),
    consent: Boolean(data.consent),
    ts: String(data.ts || ""),
    page: String(data.page || ""),
    userAgent: String(data.userAgent || "")
  };
}

function getSpreadsheet_() {
  // If bound script, this will work.
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Fallback for unbound script: use SPREADSHEET_ID.
  }

  // Uncomment and set SPREADSHEET_ID when needed.
  // return SpreadsheetApp.openById(SPREADSHEET_ID);
  throw new Error("Spreadsheet not available. Bind the script to a spreadsheet or set SPREADSHEET_ID.");
}

function getOrCreateSheet_(ss) {
  const existing = ss.getSheetByName(SHEET_NAME);
  if (existing) return existing;
  return ss.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(["createdAt", "whatsapp", "page", "userAgent", "ts"]);
}

function json_(status, obj) {
  // ContentService doesn't let us set CORS headers; clients should use sendBeacon.
  const output = ContentService.createTextOutput(JSON.stringify({ status, ...obj }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

