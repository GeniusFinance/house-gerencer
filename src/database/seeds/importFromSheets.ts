require("dotenv").config();

import { getGoogleSheetsData } from "@/lib/googleSheets";
import {
  Account,
  Category,
  Credit,
  Expense,
  Income,
  Person,
  Tag,
  Transfer
} from "@/src/entities";
import "reflect-metadata";
import { AppDataSource, initializeDataSource } from "../connection";

interface SheetRow {
  [key: string]: string | number;
}

interface ImportStats {
  expenses: number;
  incomes: number;
  credits: number;
  transfers: number;
  errors: string[];
}


async function getOrCreateEntity<T>(
  EntityClass: any,
  where: { [key: string]: any },
  createData: { [key: string]: any }
): Promise<T> {
  const repository = AppDataSource.getRepository(EntityClass);

  let entity = await repository.findOne({ where });

  if (!entity) {
    entity = repository.create(createData);
    await repository.save(entity);
  }

  return entity as T;
}


function parseDate(dateString: string): string {
  if (!dateString) return new Date().toISOString().split("T")[0];

  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, 
    /(\d{4})-(\d{1,2})-(\d{1,2})/, 
  ];

  for (const format of formats) {
    const match = dateString.toString().trim().match(format);
    if (match) {
      if (format === formats[0]) {
        const [, month, day, year] = match;
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split("T")[0];
        }
      } else {
        const [, year, month, day] = match;
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split("T")[0];
        }
      }
    }
  }

  return new Date().toISOString().split("T")[0];
}

async function importExpenses(
  spreadsheetId: string,
  stats: ImportStats,
  range: string = "Expenses!A1:H100"
): Promise<number> {
  try {
    console.log("📥 Reading Expenses from Google Sheets...");
    const rows = await getGoogleSheetsData(spreadsheetId, range);

    if (!rows || rows.length === 0) {
      console.log("⚠️  No expense data found");
      return 0;
    }

    const expenseRepository = AppDataSource.getRepository(Expense);
    let count = 0;

    for (const row of rows) {
      try {
        const accountName = row.account || row.Account || "Default";
        const categoryName = row.category || row.Category || "Other";
        const tagNames = (row.tags || row.Tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t);

        const account = await getOrCreateEntity(
          Account,
          { name: accountName },
          {
            name: accountName,
            type: "bank",
            status: "active",
            balance: 0,
          }
        );

        const category = await getOrCreateEntity(
          Category,
          { name: categoryName },
          {
            name: categoryName,
            type: "expense",
            isActive: true,
          }
        );

        const tags = [];
        for (const tagName of tagNames) {
          const tag = await getOrCreateEntity(
            Tag,
            { name: tagName },
            {
              name: tagName,
              color: "#808080",
            }
          );
          tags.push(tag);
        }

        const expense = expenseRepository.create({
          date: parseDate(String(row.date || row.Date || '')),
          description: String(row.description || row.Description || ""),
          value: parseFloat(String(row.value || row.Value || "0")),
          account,
          category,
          tags,
          code: String(row.code || row.Code || `EXP-${Date.now()}`),
          status: String(row.status || row.Status || "completed"),
        });

        await expenseRepository.save(expense);
        count++;
      } catch (error) {
        stats.errors.push(`Expense row error: ${error}`);
      }
    }

    console.log(`✅ Imported ${count} expenses`);
    stats.expenses = count;
    return count;
  } catch (error) {
    console.error("❌ Error importing expenses:", error);
    stats.errors.push(`Expenses import failed: ${error}`);
    return 0;
  }
}

/**
 * Import Income from Google Sheets
 * Expected columns: date, description, value, account, category, tags, status
 */
async function importIncome(
  spreadsheetId: string,
  stats: ImportStats,
  range: string = "Income!A1:H100"
): Promise<number> {
  try {
    console.log("📥 Reading Income from Google Sheets...");
    let rows;
    try {
      rows = await getGoogleSheetsData(spreadsheetId, range);
    } catch (error) {
      console.log("⚠️  Income sheet not found or inaccessible, skipping...");
      return 0;
    }

    if (!rows || rows.length === 0) {
      console.log("⚠️  No income data found");
      return 0;
    }

    const incomeRepository = AppDataSource.getRepository(Income);
    let count = 0;

    for (const row of rows) {
      try {
        const accountName = row.account || row.Account || "Default";
        const categoryName = row.category || row.Category || "Salary";
        const tagNames = (row.tags || row.Tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t);

        const account = await getOrCreateEntity(
          Account,
          { name: accountName },
          {
            name: accountName,
            type: "bank",
            status: "active",
            balance: 0,
          }
        );

        const category = await getOrCreateEntity(
          Category,
          { name: categoryName },
          {
            name: categoryName,
            type: "income",
            isActive: true,
          }
        );

        const tags = [];
        for (const tagName of tagNames) {
          const tag = await getOrCreateEntity(
            Tag,
            { name: tagName },
            {
              name: tagName,
              color: "#008000",
            }
          );
          tags.push(tag);
        }

        const income = incomeRepository.create({
          date: parseDate(String(row.date || row.Date || '')),
          description: String(row.description || row.Description || ""),
          value: parseFloat(String(row.value || row.Value || "0")),
          account,
          category,
          tags,
          status: String(row.status || row.Status || "completed"),
        });

        await incomeRepository.save(income);
        count++;
      } catch (error) {
        stats.errors.push(`Income row error: ${error}`);
      }
    }

    console.log(`✅ Imported ${count} income records`);
    stats.incomes = count;
    return count;
  } catch (error) {
    console.error("❌ Error importing income:", error);
    stats.errors.push(`Income import failed: ${error}`);
    return 0;
  }
}

/**
 * Import Credits from Google Sheets
 * Expected columns: purchaseDate, validateDate, description, value, account, category, person, creditCard, tags, status
 */
async function importCredits(
  spreadsheetId: string,
  stats: ImportStats,
  range: string = "Credits!A1:K100"
): Promise<number> {
  try {
    console.log("📥 Reading Credits from Google Sheets...");
    let rows;
    try {
      rows = await getGoogleSheetsData(spreadsheetId, range);
    } catch (error) {
      console.log("⚠️  Credits sheet not found or inaccessible, skipping...");
      return 0;
    }

    if (!rows || rows.length === 0) {
      console.log("⚠️  No credit data found");
      return 0;
    }

    const creditRepository = AppDataSource.getRepository(Credit);
    let count = 0;

    for (const row of rows) {
      try {
        const accountName = row.account || row.Account || "Default";
        const categoryName = row.category || row.Category || "Other";
        const personName = row.person || row.Person;
        const tagNames = (row.tags || row.Tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t);

        const account = await getOrCreateEntity(
          Account,
          { name: accountName },
          {
            name: accountName,
            type: "bank",
            status: "active",
            balance: 0,
          }
        );

        const category = await getOrCreateEntity(
          Category,
          { name: categoryName },
          {
            name: categoryName,
            type: "credit",
            isActive: true,
          }
        );

        let person = null;
        if (personName) {
          person = await getOrCreateEntity(
            Person,
            { name: personName },
            {
              name: personName,
              email: `${personName
                .toLowerCase()
                .replace(/\s+/g, ".")}@example.com`,
            }
          );
        }

        const tags = [];
        for (const tagName of tagNames) {
          const tag = await getOrCreateEntity(
            Tag,
            { name: tagName },
            {
              name: tagName,
              color: "#FF0000",
            }
          );
          tags.push(tag);
        }

        const credit = creditRepository.create({
          purchaseDate: parseDate(String(row.purchaseDate || row.PurchaseDate || '')),
          validateDate:
            row.validateDate || row.ValidateDate
              ? parseDate(String(row.validateDate || row.ValidateDate || ''))
              : undefined,
          description: String(row.description || row.Description || ""),
          value: parseFloat(String(row.value || row.Value || "0")),
          account,
          category,
          person: person ?? undefined,
          tags,
          code: String(row.code || row.Code || `CRD-${Date.now()}`),
          status: String(row.status || row.Status || "pending"),
        });

        await creditRepository.save(credit);
        count++;
      } catch (error) {
        stats.errors.push(`Credit row error: ${error}`);
      }
    }

    console.log(`✅ Imported ${count} credits`);
    stats.credits = count;
    return count;
  } catch (error) {
    console.error("❌ Error importing credits:", error);
    stats.errors.push(`Credits import failed: ${error}`);
    return 0;
  }
}

/**
 * Import Transfers from Google Sheets
 * Expected columns: date, sourceAccount, destinationAccount, value, tags
 */
async function importTransfers(
  spreadsheetId: string,
  stats: ImportStats,
  range: string = "Transfers!A1:E100"
): Promise<number> {
  try {
    console.log("📥 Reading Transfers from Google Sheets...");
    const rows = await getGoogleSheetsData(spreadsheetId, range);

    if (!rows || rows.length === 0) {
      console.log("⚠️  No transfer data found");
      return 0;
    }

    const transferRepository = AppDataSource.getRepository(Transfer);
    let count = 0;

    for (const row of rows) {
      try {
        const sourceAccountName =
          row.sourceAccount || row.SourceAccount || row.from || row.From;
        const destAccountName =
          row.destinationAccount || row.DestinationAccount || row.to || row.To;
        const tagNames = (row.tags || row.Tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t);

        if (!sourceAccountName || !destAccountName) {
          stats.errors.push(
            "Transfer row missing source or destination account"
          );
          continue;
        }

        const sourceAccount = await getOrCreateEntity(
          Account,
          { name: sourceAccountName },
          {
            name: sourceAccountName,
            type: "bank",
            status: "active",
            balance: 0,
          }
        );

        const destinationAccount = await getOrCreateEntity(
          Account,
          { name: destAccountName },
          {
            name: destAccountName,
            type: "bank",
            status: "active",
            balance: 0,
          }
        );

        const tags = [];
        for (const tagName of tagNames) {
          const tag = await getOrCreateEntity(
            Tag,
            { name: tagName },
            {
              name: tagName,
              color: "#0000FF",
            }
          );
          tags.push(tag);
        }

        const transfer = transferRepository.create({
          date: parseDate(String(row.date || row.Date || '')),
          sourceAccount,
          destinationAccount,
          value: parseFloat(String(row.value || row.Value || "0")),
          tags,
        });

        await transferRepository.save(transfer);
        count++;
      } catch (error) {
        stats.errors.push(`Transfer row error: ${error}`);
      }
    }

    console.log(`✅ Imported ${count} transfers`);
    stats.transfers = count;
    return count;
  } catch (error) {
    console.error("❌ Error importing transfers:", error);
    stats.errors.push(`Transfers import failed: ${error}`);
    return 0;
  }
}

/**
 * Main seed function
 */
async function seedFromGoogleSheets() {

  const spreadsheetIds = [
    process.env.GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID,
    process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID,
    process.env.GOOGLE_SHEETS_SPREADSHEET_INCOME_ID,
    process.env.GOOGLE_SHEETS_SPREADSHEET_TRANSFER_ID,
  ].filter((id) => id);

  const ranges = [
    process.env.GOOGLE_SHEETS_EXPENSE_RANGE,
    process.env.GOOGLE_SHEETS_CREDIT_RANGE,
    process.env.GOOGLE_SHEETS_INCOME_RANGE,
    process.env.GOOGLE_SHEETS_TRANSFER_RANGE,
  ];


  if (!spreadsheetIds) {
    console.error("❌ Missing required environment variables:");
    console.error("   - GOOGLE_SHEETS_SPREADSHEET_EXPENSE_ID");
    process.exit(1);
  }

  const stats: ImportStats = {
    expenses: 0,
    incomes: 0,
    credits: 0,
    transfers: 0,
    errors: [],
  };

  try {
    await initializeDataSource();
    console.log("🔗 Connected to database");

    //await importExpenses(spreadsheetIds[0], stats, ranges[0]);
    //await importIncome(spreadsheetIds[2], stats, ranges[2]);
    await importCredits(spreadsheetIds[1]!, stats, ranges[1]);
    await importTransfers(spreadsheetIds[3]!, stats, ranges[3]);

    console.log("\n" + "=".repeat(50));
    console.log("📊 Import Summary");
    console.log("=".repeat(50));
    console.log(`✅ Expenses:  ${stats.expenses}`);
    console.log(`✅ Income:    ${stats.incomes}`);
    console.log(`✅ Credits:   ${stats.credits}`);
    console.log(`✅ Transfers: ${stats.transfers}`);
    console.log(
      `📈 Total:     ${
        stats.expenses + stats.incomes + stats.credits + stats.transfers
      }`
    );

    if (stats.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      stats.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Fatal error during import:", error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Database connection closed");
  }
}

seedFromGoogleSheets();
