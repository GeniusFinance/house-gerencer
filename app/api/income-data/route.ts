import { formatCurrency } from "@/lib/dataHelpers";
import {
  appendGoogleSheetsData,
  getGoogleSheetsData,
  findRowByCode,
  updateGoogleSheetsCell,
} from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_INCOME_ID;
const range = process.env.GOOGLE_SHEETS_INCOME_RANGE;

const creditSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
const creditRange = process.env.GOOGLE_SHEETS_CREDIT_RANGE;
const CREDIT_RECEBI_COLUMN = 8;

const expenseSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID;
const expenseRange = process.env.GOOGLE_SHEETS_EXPENSE_RANGE;
const EXPENSE_TAGS_COLUMN = 7;

export async function GET(request: NextRequest) {
  try {
    const data = await getGoogleSheetsData(spreadsheetId, range);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading income data:", error);
    return NextResponse.json(
      { error: "Failed to load income data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const incomeData = (await request.json()) as {
      date?: string;
      description?: string;
      value: number;
      account?: string;
      category?: string;
      subcategory?: string;
      payer?: string;
      proofUrl?: string;
      codigoRelacao?: string;
      type?: "credit" | "expense";
    };

    const codes = incomeData.codigoRelacao?.split(", ").filter((c) => c.trim());


    const values = [
      [
        incomeData.date || new Date().toLocaleDateString("pt-BR"),
        incomeData.description || "",
        formatCurrency(incomeData.value) || "",
        incomeData.account || "",
        "Paid",
        incomeData.category || "Incomes",
        incomeData.subcategory || "",
        incomeData.payer || "",
        incomeData.proofUrl || "",
        codes ? codes.join(", ") : "",
      ],
    ];

    await appendGoogleSheetsData(spreadsheetId, range, values);

    if (codes && incomeData.type) {
      try {
        let targetSpreadsheetId: string | undefined;
        let targetRange: string | undefined;
        let columnIndex: number;
        let sheetName: string;

        targetSpreadsheetId = creditSpreadsheetId;
        targetRange = creditRange;
        columnIndex = CREDIT_RECEBI_COLUMN;
        sheetName = "credit";

        if (!targetRange || !targetSpreadsheetId) {
          throw new Error("Credit spreadsheet configuration is missing");
        }

        const updatePromises = codes.map(async (code) => {
          const rowIndex = await findRowByCode(
            targetSpreadsheetId!,
            targetRange!,
            code
          );

          if (!rowIndex) {
            console.error(`No ${incomeData.type} found with código: ${code}`);
            return null;
          }

          await updateGoogleSheetsCell(
            targetSpreadsheetId!,
            sheetName,
            rowIndex,
            columnIndex,
            "Recebi"
          );

        });
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Error updating credit/expense status:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Income registered successfully",
    });
  } catch (error) {
    console.error("Error registering income:", error);
    return NextResponse.json(
      { error: "Failed to register income" },
      { status: 500 }
    );
  }
}
