import { NextResponse } from "next/server";
import { getGoogleSheetsData } from "@/lib/googleSheets";
import {
  DashboardData,
  ExpenseRow,
  SheetRow,
  IncomeRow,
  TransferRow,
  ProjectionData,
} from "@/types/sheet";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, addMonths } from "date-fns";

// Get spreadsheet IDs from environment
const EXPENSE_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID;
const CREDIT_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
const INCOME_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_INCOME_ID;
const TRANSFERS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID; // Assuming transfers are in same sheet as expenses

// Get ranges from environment - must be defined in .env.local
const EXPENSE_RANGE = process.env.GOOGLE_SHEETS_EXPENSE_RANGE;
const CREDIT_RANGE = process.env.GOOGLE_SHEETS_CREDIT_RANGE;
const INCOME_RANGE = process.env.GOOGLE_SHEETS_INCOME_RANGE;
const TRANSFERS_RANGE = process.env.GOOGLE_SHEETS_TRANSFERS_RANGE; // Optional transfers sheet

function parseFloatValue(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const stringValue = String(value).trim();

  if (
    stringValue.includes(",") &&
    stringValue.lastIndexOf(",") > stringValue.lastIndexOf(".")
  ) {
    return parseFloat(stringValue.replace(/\./g, "").replace(",", "."));
  }

  return parseFloat(stringValue.replace(/,/g, ""));
}

function parseExpenseData(rawData: any[]): ExpenseRow[] {
  return rawData.map((row) => ({
    date: row["Date"] || row.date || "",
    description: row["Description"] || row.description || "",
    value: parseFloatValue(row["Value"] || row.value || "0"),
    account: row["Account"] || row.account || "",
    status: row["Status"] || row.status || "",
    category: row["Category"] || row.category || "",
    subcategory: row["Subcategory"] || row.subcategory || "",
    tags: row["Tags"] || row.tags || "",
    code: row["code"] || row.codigo || "",
  }));
}

function parseCreditData(rawData: any[]): SheetRow[] {
  return rawData.map((row) => ({
    purchaseDate: row["Purchase Date"] || row.purchaseDate || "",
    validateDate: row["Validate Date"] || row.validateDate || "",
    description: row["Description"] || row.description || "",
    value: parseFloatValue(row["Value"] || row.value || "0"),
    account: row["Account"] || row.account || "",
    status: row["Status"] || row.status || "",
    category: row["Category"] || row.category || "",
    subcategory: row["Subcategory"] || row.subcategory || "",
    tags: row["Tags"] || row.tags || "",
    pessoas: row["Pessoas"] || row.pessoas || "",
    credit: row["Inter pessoal"] || row.credit || "",
    card: row["Card"] || row.card || "",
    observation: row["Observation"] || row.observation || "",
    month: row["Month"] || row.month || "",
    year: row["Year"] || row.year || "",
    code: row["code"] || row.codigo || "",
    proofUrl: row["Comprovante"] || row.proofUrl || "",
  }));
}

function parseIncomeData(rawData: any[]): IncomeRow[] {
  return rawData.map((row) => ({
    date: row["Date"] || row.date || "",
    description: row["Description"] || row.description || "",
    value: parseFloatValue(row["Value"] || row.value || "0"),
    account: row["Account"] || row.account || "",
    status: row["Status"] || row.status || "",
    category: row["Category"] || row.category || "",
    subcategory: row["Subcategory"] || row.subcategory || "",
    tags: row["Tags"] || row.tags || "",
    proofUrl: row["Comprovante"] || row.proofUrl || "",
    codigoRelacao: row["Código Relacao"] || row["Código Relação"] || row.codigoRelacao || "",
    observation: row["Observation"] || row.observation || "",
    month: row["Month"] || row.month || "",
    year: row["Year"] || row.year || "",
  }));
}

function parseTransferData(rawData: any[]): TransferRow[] {
  return rawData.map((row) => ({
    date: row["Date"] || row.date || "",
    contaOrigem: row["Conta origem"] || row.contaOrigem || "",
    contaDestino: row["Conta destino"] || row.contaDestino || "",
    value: parseFloatValue(row["Value"] || row.value || "0"),
    tags: row["Tags"] || row.tags || "",
  }));
}

function calculateProjection(
  credits: SheetRow[],
  incomes: IncomeRow[],
  expenses: ExpenseRow[],
  startDate: Date,
  endDate: Date
): ProjectionData[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Calculate amounts for this date
    const toReceive = incomes
      .filter(
        (income) =>
          income.date === dateStr ||
          income.date === format(date, "dd/MM/yyyy") ||
          income.status.toLowerCase() === "pending"
      )
      .reduce((sum, income) => sum + income.value, 0);
    
    const toPay = [...credits, ...expenses]
      .filter((item) => {
        if ("validateDate" in item) {
          return (
            item.validateDate === dateStr ||
            item.validateDate === format(date, "dd/MM/yyyy") ||
            item.status.toLowerCase() === "pending"
          );
        }
        if ("date" in item) {
          return (
            item.date === dateStr ||
            item.date === format(date, "dd/MM/yyyy") ||
            item.status.toLowerCase() === "pending"
          );
        }
        return false;
      })
      .reduce((sum, item) => sum + item.value, 0);
    
    return {
      date: format(date, "dd/MM"),
      toReceive,
      toPay,
      balance: toReceive - toPay,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch data from all sheets
    const [expensesRaw, creditsRaw, incomesRaw, transfersRaw] =
      await Promise.all([
        getGoogleSheetsData(EXPENSE_SPREADSHEET_ID, EXPENSE_RANGE),
        getGoogleSheetsData(CREDIT_SPREADSHEET_ID, CREDIT_RANGE),
        getGoogleSheetsData(INCOME_SPREADSHEET_ID, INCOME_RANGE),
        // Transfers sheet might not exist, so we catch errors gracefully
        TRANSFERS_RANGE && TRANSFERS_SPREADSHEET_ID
          ? getGoogleSheetsData(TRANSFERS_SPREADSHEET_ID, TRANSFERS_RANGE).catch(() => [])
          : Promise.resolve([]),
      ]);

    // Parse data
    const expenses = parseExpenseData(expensesRaw || []);
    const credits = parseCreditData(creditsRaw || []);
    const incomes = parseIncomeData(incomesRaw || []);
    const transfers = parseTransferData(transfersRaw || []);

    // Apply date filters if provided
    let filteredExpenses = expenses;
    let filteredCredits = credits;
    let filteredIncomes = incomes;
    let filteredTransfers = transfers;

    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      filteredExpenses = expenses.filter((expense) => {
        try {
          const expenseDate = parseISO(expense.date.split("/").reverse().join("-"));
          return expenseDate >= start && expenseDate <= end;
        } catch {
          return true;
        }
      });

      filteredCredits = credits.filter((credit) => {
        try {
          const creditDate = parseISO(credit.purchaseDate.split("/").reverse().join("-"));
          return creditDate >= start && creditDate <= end;
        } catch {
          return true;
        }
      });

      filteredIncomes = incomes.filter((income) => {
        try {
          const incomeDate = parseISO(income.date.split("/").reverse().join("-"));
          return incomeDate >= start && incomeDate <= end;
        } catch {
          return true;
        }
      });

      filteredTransfers = transfers.filter((transfer) => {
        try {
          const transferDate = parseISO(transfer.date.split("/").reverse().join("-"));
          return transferDate >= start && transferDate <= end;
        } catch {
          return true;
        }
      });
    }

    // Calculate totals
    const totalToReceive = filteredIncomes
      .filter((income) => income.status.toLowerCase() === "pending")
      .reduce((sum, income) => sum + income.value, 0);

    const totalToPay = filteredCredits
      .filter((credit) => credit.status.toLowerCase() === "pending")
      .reduce((sum, credit) => sum + credit.value, 0);

    // Generate projection
    const projectionStart = startDate ? parseISO(startDate) : startOfMonth(new Date());
    const projectionEnd = endDate ? parseISO(endDate) : endOfMonth(addMonths(new Date(), 1));
    
    const projectionData = calculateProjection(
      filteredCredits,
      filteredIncomes,
      filteredExpenses,
      projectionStart,
      projectionEnd
    );

    const dashboardData: DashboardData = {
      totalToReceive,
      totalToPay,
      expenses: filteredExpenses,
      credits: filteredCredits,
      incomes: filteredIncomes,
      transfers: filteredTransfers,
      projectionData,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
