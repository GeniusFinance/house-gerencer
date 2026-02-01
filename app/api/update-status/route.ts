import {
  findRowByCode,
  updateGoogleSheetsCell,
} from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";

const creditSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
const creditRange = process.env.GOOGLE_SHEETS_CREDIT_RANGE;

const CREDIT_RECEBI_COLUMN = 8;

const EXPENSE_TAGS_COLUMN = 7;

export async function POST(request: NextRequest) {
  try {
    const { codigo, type } = await request.json();
    
    console.log("Update status request:", { codigo, type });

    if (!codigo) {
      return NextResponse.json(
        { error: "Código is required" },
        { status: 400 }
      );
    }

    if (!type || (type !== "credit" && type !== "expense")) {
      return NextResponse.json(
        { error: "Type must be either 'credit' or 'expense'" },
        { status: 400 }
      );
    }

    let spreadsheetId: string | undefined;
    let range: string | undefined;
    let columnIndex: number;
    let sheetName: string;

    if (type === "credit") {
      spreadsheetId = creditSpreadsheetId;
      range = creditRange;
      columnIndex = CREDIT_RECEBI_COLUMN;
      sheetName = "credit";
    } else {
      spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID || creditSpreadsheetId;
      range = process.env.GOOGLE_SHEETS_EXPENSE_RANGE || "Expense!A:I";
      columnIndex = EXPENSE_TAGS_COLUMN;
      sheetName = "Expense";
    }
    
    console.log("Using spreadsheet config:", { spreadsheetId, range, columnIndex, sheetName });

    if (!spreadsheetId || !range) {
      return NextResponse.json(
        { error: "Spreadsheet configuration is missing" },
        { status: 500 }
      );
    }

    console.log("Finding row by codigo:", codigo);
    const rowIndex = await findRowByCode(spreadsheetId, range, codigo);
    
    console.log("Found row index:", rowIndex);

    if (!rowIndex) {
      return NextResponse.json(
        { error: `No ${type} found with código: ${codigo}` },
        { status: 404 }
      );
    }

    console.log("Updating cell:", { sheetName, rowIndex, columnIndex });
    await updateGoogleSheetsCell(
      spreadsheetId,
      sheetName,
      rowIndex,
      columnIndex,
      "Recebi"
    );
    
    console.log("Successfully updated cell to 'recebido'");

    return NextResponse.json({
      success: true,
      message: `${type} marked as recebi`,
      rowIndex,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
