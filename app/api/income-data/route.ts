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
    const incomeData = await request.json();
    
    console.log("Received income data:", incomeData);

    // Income structure: Date, Description, Value, Account, Status, Category, 
    //                   Subcategory, Tags, Comprovante, Código Relacao
    const values = [
      [
        incomeData.date || new Date().toLocaleDateString("pt-BR"), 
        incomeData.description || "",
        formatCurrency(incomeData.value) || "", // Value
        incomeData.account || "", // Account
        "Paid", // Status
        incomeData.category || "Incomes",
        incomeData.subcategory || "",
        incomeData.payer || "", // Tags (payer)
        incomeData.proofUrl || "", // Comprovante
        incomeData.codigoRelacao || "", // Código Relacao
      ],
    ];

    console.log("Appending to sheet:", values);
    await appendGoogleSheetsData(spreadsheetId, range, values);
    console.log("Successfully appended to sheet");

    // If codigoRelacao and type are provided, update the credit/expense status
    if (incomeData.codigoRelacao && incomeData.type) {
      console.log("Attempting to update status:", {
        codigo: incomeData.codigoRelacao,
        type: incomeData.type
      });
      
      try {
        // Directly update the sheet instead of using HTTP fetch
        let targetSpreadsheetId: string | undefined;
        let targetRange: string | undefined;
        let columnIndex: number;
        let sheetName: string;

        if (incomeData.type === "credit") {
          targetSpreadsheetId = creditSpreadsheetId;
          targetRange = creditRange;
          columnIndex = CREDIT_RECEBI_COLUMN;
          sheetName = "credit";
        } else if (incomeData.type === "expense") {
          targetSpreadsheetId = expenseSpreadsheetId || creditSpreadsheetId;
          targetRange = expenseRange || "Expense!A:I";
          columnIndex = EXPENSE_TAGS_COLUMN;
          sheetName = "Expense";
        } else {
          throw new Error(`Invalid type: ${incomeData.type}`);
        }

        if (!targetSpreadsheetId || !targetRange) {
          console.error("Spreadsheet configuration is missing");
        } else {
          // Find the row using código from the UI
          console.log("Finding row by código:", incomeData.codigoRelacao, targetSpreadsheetId, targetRange);
          const rowIndex = await findRowByCode(targetSpreadsheetId, targetRange, incomeData.codigoRelacao);
          
          if (!rowIndex) {
            console.error(`No ${incomeData.type} found with código: ${incomeData.codigoRelacao}`);
          } else {
            console.log("Updating cell:", { sheetName, rowIndex, columnIndex, codigo: incomeData.codigoRelacao });
            await updateGoogleSheetsCell(
              targetSpreadsheetId,
              sheetName,
              rowIndex,
              columnIndex,
              "Recebi"
            );
            console.log("Successfully updated status to 'recebi' for código:", incomeData.codigoRelacao);
          }
        }
      } catch (error) {
        console.error("Error updating credit/expense status:", error);
        // Don't fail the income registration if status update fails
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
