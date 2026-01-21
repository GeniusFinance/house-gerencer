import { google } from "googleapis";

function authenticateGoogleSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replaceAll("\\n", "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return google.sheets({ version: "v4", auth });
}

export async function getGoogleSheetsData(
  spreadsheetId?: string,
  range?: string
) {
  try {
    const sheets = authenticateGoogleSheets();

    if (!spreadsheetId) {
      throw new Error("Spreadsheet ID is required");
    }

    if (!range) {
      throw new Error("Range is required");
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const data = rows.slice(1);

    return data.map((row) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    throw error;
  }
}

export async function appendGoogleSheetsData(
  spreadsheetId?: string,
  range?: string,
  values?: any[][]
) {
  try {
    if (!spreadsheetId) {
      throw new Error("Spreadsheet ID is required");
    }

    if (!range) {
      throw new Error("Range is required");
    }

    if (!values) {
      throw new Error("Values are required");
    }

    const sheets = authenticateGoogleSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error("Error appending Google Sheets data:", error);
    throw error;
  }
}
