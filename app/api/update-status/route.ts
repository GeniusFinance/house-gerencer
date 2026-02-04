import { findRowByCode, updateGoogleSheetsCell } from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";

const creditSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
const creditRange = process.env.GOOGLE_SHEETS_CREDIT_RANGE;

const CREDIT_RECEBI_COLUMN = 8;

const EXPENSE_TAGS_COLUMN = 7;

export async function POST(request: NextRequest) {
  try {
    const { codigo, type } = (await request.json()) as {
      codigo: string;
      type: "credit" | "expense";
    };

    const codigoArray = codigo.split(", ").filter((c) => c.trim());

    if (!codigoArray || codigoArray.length === 0) {
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
      spreadsheetId =
        process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID || creditSpreadsheetId;
      range = process.env.GOOGLE_SHEETS_EXPENSE_RANGE || "Expense!A:I";
      columnIndex = EXPENSE_TAGS_COLUMN;
      sheetName = "Expense";
    }

    if (!spreadsheetId || !range) {
      return NextResponse.json(
        { error: "Spreadsheet configuration is missing" },
        { status: 500 }
      );
    }

    const updatePromises = codigoArray.map(async (code) => {
      const rowIndex = await findRowByCode(spreadsheetId!, range!, code);

      if (!rowIndex) {
        console.warn(`No ${type} found with código: ${code}`);
        return null;
      }

      await updateGoogleSheetsCell(
        spreadsheetId!,
        sheetName,
        rowIndex,
        columnIndex,
        "Recebi"
      );

      return { code, rowIndex };
    });

    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter((r) => r !== null);

    if (successfulUpdates.length === 0) {
      return NextResponse.json(
        { error: `No ${type} found with códigos: ${codigoArray.join(", ")}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${successfulUpdates.length} ${type}(s) marked as recebi`,
      updates: successfulUpdates,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
