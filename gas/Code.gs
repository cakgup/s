/*******************************************************
 * CAKGUP SHORTLINK - GOOGLE APPS SCRIPT API
 * Versi final fix redirect Google Docs/Sheets URL.
 *
 * doGet  : resolve shortlink / list link publik / ping
 * doPost : create, update, disable shortlink
 *
 * Endpoint Web App aktif:
 * https://script.google.com/macros/s/SCRIPT_ID/exec
 *******************************************************/

/**
 * =========================
 * KONFIGURASI UTAMA
 * =========================
 */
const CONFIG = {
  // Jika Apps Script dibuat dari Google Sheet, boleh dikosongkan.
  // Jika Apps Script standalone, script akan otomatis membuat database spreadsheet baru
  // saat testSetup() dijalankan.
  SPREADSHEET_ID: "CEK_EXEL_ID",

  SHEET_LINKS: "links",
  SHEET_LOGS: "click_logs",

  BASE_SHORTLINK: "https://cakgup.github.io/s",

  // Token untuk doPost. Sementara: ******.
  API_TOKEN: "******"
};

const SCRIPT_PROPERTY_SPREADSHEET_ID = "CAKGUP_SHORTLINK_SPREADSHEET_ID";

/**
 * =========================
 * STRUKTUR KOLOM SHEET
 * =========================
 */
const LINK_HEADERS = [
  "id",
  "link_name",
  "target_url",
  "title",
  "description",
  "category",
  "public",
  "status",
  "created_at",
  "updated_at",
  "created_by"
];

const LOG_HEADERS = [
  "timestamp",
  "link_name",
  "target_url",
  "user_agent",
  "result"
];

/**
 * =========================
 * doGet
 * =========================
 *
 * Contoh:
 * ?action=ping
 * ?action=list
 * ?link_name=tes
 * ?slug=tes
 */
function doGet(e) {
  try {
    setupSheets();

    const params = e && e.parameter ? e.parameter : {};
    const action = String(params.action || "").toLowerCase().trim();
    const linkName = sanitizeLinkName(params.link_name || params.slug || "");

    if (action === "ping") {
      return jsonOutput({
        success: true,
        message: "Cakgup Shortlink API aktif",
        spreadsheet_id: getSpreadsheet().getId(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "list") {
      return jsonOutput(listPublicLinks(params));
    }

    if (!linkName) {
      return jsonOutput({
        success: false,
        message: "Parameter link_name wajib diisi"
      });
    }

    return jsonOutput(resolveShortlink(linkName, e));

  } catch (error) {
    return jsonOutput({
      success: false,
      message: "Terjadi kesalahan pada doGet",
      error: getErrorMessage(error)
    });
  }
}

/**
 * =========================
 * doPost
 * =========================
 *
 * Body JSON create:
 * {
 *   "token": "cakgup",
 *   "action": "create",
 *   "link_name": "tes",
 *   "target_url": "https://docs.google.com/spreadsheets/d/xxx/edit?usp=sharing",
 *   "title": "Tes",
 *   "description": "Tes redirect",
 *   "category": "testing",
 *   "public": true,
 *   "created_by": "admin"
 * }
 */
function doPost(e) {
  try {
    setupSheets();

    const body = parsePostBody(e);
    const action = String(body.action || "create").toLowerCase().trim();

    if (!isValidToken(body)) {
      return jsonOutput({
        success: false,
        message: "Token tidak valid"
      });
    }

    if (action === "create") {
      return jsonOutput(createShortlink(body));
    }

    if (action === "update") {
      return jsonOutput(updateShortlink(body));
    }

    if (action === "delete" || action === "disable") {
      return jsonOutput(disableShortlink(body));
    }

    return jsonOutput({
      success: false,
      message: "Action tidak dikenali. Gunakan create, update, delete, atau disable."
    });

  } catch (error) {
    return jsonOutput({
      success: false,
      message: "Terjadi kesalahan pada doPost",
      error: getErrorMessage(error)
    });
  }
}

/**
 * =========================
 * CREATE SHORTLINK
 * =========================
 */
function createShortlink(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getLinksSheet();

    let linkName = sanitizeLinkName(body.link_name || "");
    const targetUrl = normalizeUrl(body.target_url || "");

    if (!targetUrl) {
      return {
        success: false,
        message: "target_url wajib diisi"
      };
    }

    if (!isValidUrl(targetUrl)) {
      return {
        success: false,
        message: "target_url tidak valid. Gunakan URL lengkap dengan http:// atau https://"
      };
    }

    if (!linkName) {
      linkName = generateSlugFromUrl(targetUrl);
    }

    if (!isValidLinkName(linkName)) {
      return {
        success: false,
        message: "link_name hanya boleh berisi huruf kecil, angka, dan tanda hubung"
      };
    }

    if (findRowByLinkName(linkName)) {
      return {
        success: false,
        message: "link_name sudah digunakan"
      };
    }

    const now = new Date();
    const id = generateId();

    const row = [
      id,
      linkName,
      targetUrl,
      String(body.title || linkName).trim(),
      String(body.description || "").trim(),
      String(body.category || "").trim(),
      normalizeBoolean(body.public, true),
      "aktif",
      now,
      now,
      String(body.created_by || "admin").trim()
    ];

    sheet.appendRow(row);

    return {
      success: true,
      message: "Shortlink berhasil dibuat",
      id: id,
      link_name: linkName,
      shortlink: buildShortlink(linkName, body),
      target_url: targetUrl
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================
 * UPDATE SHORTLINK
 * =========================
 */
function updateShortlink(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const linkName = sanitizeLinkName(body.link_name || "");

    if (!linkName) {
      return {
        success: false,
        message: "link_name wajib diisi untuk update"
      };
    }

    const found = findRowByLinkName(linkName);

    if (!found) {
      return {
        success: false,
        message: "Shortlink tidak ditemukan"
      };
    }

    const sheet = getLinksSheet();
    const rowNumber = found.rowNumber;
    const current = found.data;

    const targetUrl = body.target_url ? normalizeUrl(body.target_url) : normalizeUrl(current.target_url || "");

    if (!isValidUrl(targetUrl)) {
      return {
        success: false,
        message: "target_url tidak valid"
      };
    }

    const updatedData = [
      current.id,
      current.link_name,
      targetUrl,
      body.title !== undefined ? String(body.title).trim() : current.title,
      body.description !== undefined ? String(body.description).trim() : current.description,
      body.category !== undefined ? String(body.category).trim() : current.category,
      body.public !== undefined ? normalizeBoolean(body.public, true) : normalizeBoolean(current.public, true),
      body.status !== undefined ? String(body.status).trim() : current.status,
      current.created_at,
      new Date(),
      body.created_by !== undefined ? String(body.created_by).trim() : current.created_by
    ];

    sheet.getRange(rowNumber, 1, 1, LINK_HEADERS.length).setValues([updatedData]);

    return {
      success: true,
      message: "Shortlink berhasil diperbarui",
      link_name: linkName,
      shortlink: buildShortlink(linkName, body),
      target_url: targetUrl
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================
 * DISABLE SHORTLINK
 * =========================
 */
function disableShortlink(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const linkName = sanitizeLinkName(body.link_name || "");

    if (!linkName) {
      return {
        success: false,
        message: "link_name wajib diisi untuk delete/disable"
      };
    }

    const found = findRowByLinkName(linkName);

    if (!found) {
      return {
        success: false,
        message: "Shortlink tidak ditemukan"
      };
    }

    const sheet = getLinksSheet();
    const rowNumber = found.rowNumber;

    const statusCol = LINK_HEADERS.indexOf("status") + 1;
    const updatedAtCol = LINK_HEADERS.indexOf("updated_at") + 1;

    sheet.getRange(rowNumber, statusCol).setValue("nonaktif");
    sheet.getRange(rowNumber, updatedAtCol).setValue(new Date());

    return {
      success: true,
      message: "Shortlink berhasil dinonaktifkan",
      link_name: linkName
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================
 * RESOLVE SHORTLINK
 * =========================
 */
function resolveShortlink(linkName, e) {
  const found = findRowByLinkName(linkName);

  if (!found) {
    logClick(linkName, "", e, "not_found");

    return {
      success: false,
      message: "Shortlink tidak ditemukan",
      link_name: linkName
    };
  }

  const data = found.data;
  const targetUrl = normalizeUrl(data.target_url || "");

  if (String(data.status).toLowerCase() !== "aktif") {
    logClick(linkName, targetUrl, e, "inactive");

    return {
      success: false,
      message: "Shortlink tidak aktif",
      link_name: linkName
    };
  }

  if (!isValidUrl(targetUrl)) {
    logClick(linkName, targetUrl, e, "invalid_url");

    return {
      success: false,
      message: "Target URL tidak valid",
      link_name: linkName,
      target_url: targetUrl
    };
  }

  logClick(linkName, targetUrl, e, "success");

  return {
    success: true,
    link_name: data.link_name,
    target_url: targetUrl,
    title: data.title,
    description: data.description,
    category: data.category,
    shortlink: buildShortlink(data.link_name, e && e.parameter ? e.parameter : {})
  };
}

/**
 * =========================
 * LIST PUBLIC LINKS
 * =========================
 */
function listPublicLinks(params) {
  const rows = getAllLinkObjects();

  const data = rows
    .filter(function(item) {
      return normalizeBoolean(item.public, false) === true &&
        String(item.status).toLowerCase() === "aktif";
    })
    .map(function(item) {
      return {
        link_name: item.link_name,
        title: item.title,
        description: item.description,
        category: item.category,
        shortlink: buildShortlink(item.link_name, params)
      };
    });

  return {
    success: true,
    total: data.length,
    data: data
  };
}

/**
 * =========================
 * SHEET SETUP
 * =========================
 */
function setupSheets() {
  const ss = getSpreadsheet();

  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan. Isi CONFIG.SPREADSHEET_ID atau jalankan script dari Google Sheets.");
  }

  let linksSheet = ss.getSheetByName(CONFIG.SHEET_LINKS);
  if (!linksSheet) {
    linksSheet = ss.insertSheet(CONFIG.SHEET_LINKS);
  }

  ensureHeaders(linksSheet, LINK_HEADERS);

  let logsSheet = ss.getSheetByName(CONFIG.SHEET_LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEET_LOGS);
  }

  ensureHeaders(logsSheet, LOG_HEADERS);

  linksSheet.setFrozenRows(1);
  logsSheet.setFrozenRows(1);
}

function ensureHeaders(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const currentHeaders = firstRow.map(function(cell) {
    return String(cell || "").trim();
  });

  const isEmpty = currentHeaders.every(function(cell) {
    return cell === "";
  });

  const different = headers.some(function(header, index) {
    return currentHeaders[index] !== header;
  });

  if (isEmpty || different) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

/**
 * =========================
 * HELPER SPREADSHEET
 * =========================
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && String(CONFIG.SPREADSHEET_ID).trim() !== "") {
    return SpreadsheetApp.openById(String(CONFIG.SPREADSHEET_ID).trim());
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty(SCRIPT_PROPERTY_SPREADSHEET_ID);

  if (savedId) {
    return SpreadsheetApp.openById(savedId);
  }

  const created = SpreadsheetApp.create("Cakgup Shortlink Database");
  props.setProperty(SCRIPT_PROPERTY_SPREADSHEET_ID, created.getId());

  return created;
}

function getLinksSheet() {
  const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_LINKS);
  if (!sheet) {
    throw new Error("Sheet links tidak ditemukan. Jalankan testSetup terlebih dahulu.");
  }
  return sheet;
}

function getLogsSheet() {
  const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_LOGS);
  if (!sheet) {
    throw new Error("Sheet click_logs tidak ditemukan. Jalankan testSetup terlebih dahulu.");
  }
  return sheet;
}

function getAllLinkObjects() {
  const sheet = getLinksSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, LINK_HEADERS.length).getValues();

  return values.map(function(row) {
    return rowToObject(row, LINK_HEADERS);
  });
}

function rowToObject(row, headers) {
  const obj = {};

  headers.forEach(function(header, index) {
    obj[header] = row[index];
  });

  return obj;
}

function findRowByLinkName(linkName) {
  const sheet = getLinksSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, LINK_HEADERS.length).getValues();

  for (let i = 0; i < values.length; i++) {
    const obj = rowToObject(values[i], LINK_HEADERS);

    if (String(obj.link_name).toLowerCase() === String(linkName).toLowerCase()) {
      return {
        rowNumber: i + 2,
        data: obj
      };
    }
  }

  return null;
}

/**
 * =========================
 * LOG CLICK
 * =========================
 */
function logClick(linkName, targetUrl, e, result) {
  try {
    const sheet = getLogsSheet();

    let userAgent = "";

    if (e && e.parameter && e.parameter.ua) {
      userAgent = e.parameter.ua;
    }

    sheet.appendRow([
      new Date(),
      linkName,
      targetUrl,
      userAgent,
      result
    ]);

  } catch (error) {
    // Log tidak boleh mengganggu proses redirect.
  }
}

/**
 * =========================
 * HELPER VALIDASI
 * =========================
 */
function parsePostBody(e) {
  if (!e) {
    return {};
  }

  if (e.postData && e.postData.contents) {
    const raw = e.postData.contents;

    try {
      return JSON.parse(raw);
    } catch (error) {
      // fallback ke parameter
    }
  }

  return e.parameter || {};
}

function isValidToken(body) {
  const token =
    body.token ||
    body.api_key ||
    body.apiToken ||
    body.api_token ||
    "";

  return String(token || "").trim() === CONFIG.API_TOKEN;
}

function sanitizeLinkName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidLinkName(value) {
  return /^[a-z0-9-]+$/.test(String(value || ""));
}

/**
 * Normalisasi URL:
 * - menghapus spasi di awal/akhir,
 * - menghapus zero-width character yang kadang ikut tersalin,
 * - tidak mengubah query string URL.
 */
function normalizeUrl(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/**
 * Validasi URL dibuat longgar, karena Google Apps Script tidak selalu cocok
 * memakai constructor `new URL()` seperti browser/Node.js.
 *
 * Syarat:
 * - diawali http:// atau https://
 * - ada host setelah protocol
 * - tidak ada spasi/karakter kontrol
 *
 * Contoh valid:
 * https://docs.google.com/spreadsheets/d/xxx/edit?usp=sharing
 */
function isValidUrl(value) {
  const text = normalizeUrl(value);

  if (!/^https?:\/\//i.test(text)) {
    return false;
  }

  if (/[\s<>"]/g.test(text)) {
    return false;
  }

  const afterProtocol = text.replace(/^https?:\/\//i, "");
  const host = afterProtocol.split("/")[0];

  if (!host) {
    return false;
  }

  if (host.indexOf(".") === -1 && host.toLowerCase() !== "localhost") {
    return false;
  }

  return true;
}

function normalizeBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value).toLowerCase().trim();

  if (["true", "1", "yes", "ya", "y"].indexOf(text) !== -1) {
    return true;
  }

  if (["false", "0", "no", "tidak", "n"].indexOf(text) !== -1) {
    return false;
  }

  return defaultValue;
}

function generateId() {
  return "SL-" + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function getBaseShortlink(source) {
  source = source || {};
  const baseUrl = String(source.shortlink_base_url || source.base_shortlink || source.base_url || "").trim();

  if (/^https?:\/\/[^\s]+$/i.test(baseUrl)) {
    return baseUrl.replace(/\/$/, "");
  }

  return CONFIG.BASE_SHORTLINK.replace(/\/$/, "");
}

function buildShortlink(linkName, source) {
  return getBaseShortlink(source) + "/" + linkName;
}

function generateSlugFromUrl(url) {
  const text = normalizeUrl(url);

  let withoutProtocol = text.replace(/^https?:\/\//i, "");
  let withoutQuery = withoutProtocol.split("?")[0].split("#")[0];
  let parts = withoutQuery.split("/").filter(function(part) {
    return part !== "";
  });

  let candidate = parts.length > 1 ? parts[parts.length - 1] : parts[0];

  candidate = String(candidate || "")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();

  return sanitizeLinkName(candidate) || "link-" + new Date().getTime();
}

function getErrorMessage(error) {
  if (!error) return "Unknown error";
  if (error.stack) return String(error.stack);
  if (error.message) return String(error.message);
  return String(error);
}

/**
 * =========================
 * OUTPUT JSON
 * =========================
 */
function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================
 * TEST MANUAL
 * =========================
 */
function testSetup() {
  setupSheets();

  return {
    success: true,
    message: "Sheet links dan click_logs berhasil disiapkan",
    spreadsheet_id: getSpreadsheet().getId(),
    spreadsheet_url: getSpreadsheet().getUrl()
  };
}

function testValidateUrl() {
  const url = "https://docs.google.com/spreadsheets/d/1gAI1OVx3mbDXqt_zN8QA2g8Vj6UlLxtxyiezylcR4AU/edit?usp=sharing";
  const result = {
    url: url,
    normalized: normalizeUrl(url),
    valid: isValidUrl(url)
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function testResolveTes() {
  setupSheets();

  const result = resolveShortlink("tes", null);

  Logger.log(JSON.stringify(result));
  return result;
}

function testCreateShortlink() {
  setupSheets();

  const result = createShortlink({
    token: CONFIG.API_TOKEN,
    action: "create",
    link_name: "contoh",
    target_url: "https://example.com",
    title: "Contoh Shortlink",
    description: "Ini adalah contoh shortlink",
    category: "contoh",
    public: true,
    created_by: "admin"
  });

  Logger.log(JSON.stringify(result));
  return result;
}

function testResolveShortlink() {
  setupSheets();

  const result = resolveShortlink("contoh", null);

  Logger.log(JSON.stringify(result));
  return result;
}
