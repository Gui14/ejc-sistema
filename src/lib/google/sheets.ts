import { google } from "googleapis";
import { getAuthenticatedOAuthClient } from "./oauth";

export function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  if (!spreadsheetId) {
    throw new Error(
      "GOOGLE_SHEETS_ID não foi configurado.",
    );
  }

  return spreadsheetId.trim();
}

export function getSheetsClient() {
  const auth = getAuthenticatedOAuthClient();

  return google.sheets({
    version: "v4",
    auth,
  });
}

export async function appendSheetRow(
  sheetName: string,
  values: unknown[],
) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:ZZ`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
}

export async function getSheetRows(
  sheetName: string,
) {
  const now = Date.now();
  const cached =
    sheetCache.get(sheetName);

  if (
    cached &&
    cached.expiresAt > now
  ) {
    return cached.rows;
  }

  const sheets = getSheetsClient();

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: `${sheetName}!A:ZZ`,
      majorDimension: "ROWS",
    });

  const rows =
    (response.data.values ?? []) as string[][];

  sheetCache.set(sheetName, {
    rows,
    expiresAt:
      now + SHEET_CACHE_TTL_MS,
  });

  return rows;
}

type SheetCacheEntry = {
  rows: string[][];
  expiresAt: number;
};

export function clearSheetCache(
  sheetName?: string,
) {
  if (sheetName) {
    sheetCache.delete(sheetName);
    return;
  }

  sheetCache.clear();
}

const sheetCache =
  new Map<string, SheetCacheEntry>();

const SHEET_CACHE_TTL_MS = 15_000;

export async function updateSheetRow(
  sheetName: string,
  rowNumber: number,
  values: unknown[],
) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}