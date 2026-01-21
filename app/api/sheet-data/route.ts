import { getGoogleSheetsData } from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
    const range = process.env.GOOGLE_SHEETS_CREDIT_RANGE;
    const data = await getGoogleSheetsData(spreadsheetId, range);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading sheet data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
