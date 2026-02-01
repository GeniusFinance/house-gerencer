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
      insertDataOption: "INSERT_ROWS", // Always insert a new row instead of overwriting
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error("Error appending Google Sheets data:", error);
    throw error;
  }
}

export async function updateGoogleSheetsCell(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  columnIndex: number,
  value: string
) {
  try {
    const sheets = authenticateGoogleSheets();

    // Convert column index to letter (0 -> A, 1 -> B, etc.)
    const columnLetter = String.fromCharCode(65 + columnIndex);
    const range = `${sheetName}!${columnLetter}${rowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
  } catch (error) {
    console.error("Error updating Google Sheets cell:", error);
    throw error;
  }
}

export async function findRowByCode(
  spreadsheetId: string,
  range: string,
  codigo: string
): Promise<number | null> {
  try {
    const data = await getGoogleSheetsData(spreadsheetId, range);
    
    console.log("Looking for código:", codigo);
    console.log("Available códigos:", data.map((row: any) => row["code"]));
    
    // Normalize for comparison (trim whitespace and compare case-insensitively)
    const normalizedCodigo = codigo.trim().toLowerCase();
    
    // Find the row index (add 2 because: 1 for header row, 1 for 1-based indexing)
    const rowIndex = data.findIndex((row: any) => {
      const rowCodigo = (row["code"] || "").trim().toLowerCase();
      return rowCodigo === normalizedCodigo;
    });
    
    if (rowIndex === -1) {
      console.log("Código not found in sheet");
      return null;
    }
    
    console.log("Found código at row index:", rowIndex + 2);
    return rowIndex + 2; // +2 to account for header and 1-based indexing
  } catch (error) {
    console.error("Error finding row by code:", error);
    throw error;
  }
}


