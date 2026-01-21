import {
    appendGoogleSheetsData,
    getGoogleSheetsData,
} from "@/lib/googleSheets";
import { NextRequest, NextResponse } from "next/server";

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_INCOME_ID;
const range = process.env.GOOGLE_SHEETS_INCOME_RANGE;

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


    const values = [
      [
        incomeData.date || new Date().toLocaleDateString("pt-BR"), 
        incomeData.description || "",
        incomeData.value || "", // Value
        incomeData.account || "", // Account
        "Paid", // Status
        incomeData.category || "Incomes",
        incomeData.subcategory || "",
        incomeData.payer || "", 
        incomeData.proofUrl || "",
      ],
    ];

    await appendGoogleSheetsData(spreadsheetId, range, values);

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
