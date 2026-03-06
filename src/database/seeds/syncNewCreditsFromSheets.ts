require("dotenv").config();

import "reflect-metadata";
import { AppDataSource, initializeDataSource } from "../connection";
import { getGoogleSheetsData } from "@/lib/googleSheets";
import { Credit } from "@/src/entities/Credit";
import { Account } from "@/src/entities/Account";
import { Category } from "@/src/entities/Category";
import { Tag } from "@/src/entities/Tag";
import { Person } from "@/src/entities/Person";
import { CreditCard } from "@/src/entities/CreditCard";
import { findOrCreate, parseSheetDate, parseValue } from "./utils/data";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID;
const RANGE = process.env.GOOGLE_SHEETS_CREDIT_RANGE;

interface SyncStats {
  inserted: number;
  skipped: number;
  errors: string[];
}

async function resolveTagsFromString(raw: string): Promise<Tag[]> {
  const names = raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const tags: Tag[] = [];
  for (const name of names) {
    const tag = await findOrCreate<Tag>(
      Tag,
      { name } as any,
      { color: "#6b7280", isActive: true } as any
    );
    tags.push(tag as Tag);
  }
  return tags;
}

async function syncNewCreditsFromSheets(): Promise<void> {
  console.log("🚀 Starting sync: new credits from Google Sheets...\n");

  if (!SPREADSHEET_ID) {
    console.error(
      "❌ Missing GOOGLE_SHEETS_SPREADSHEET_CREDIT_ID environment variable."
    );
    process.exit(1);
  }

  const stats: SyncStats = { inserted: 0, skipped: 0, errors: [] };

  try {
    await initializeDataSource();
    console.log("✅ Database connected\n");

    console.log(`📄 Fetching sheet: ${SPREADSHEET_ID} | range: ${RANGE}`);
    const rows = await getGoogleSheetsData(SPREADSHEET_ID, RANGE);

    if (!rows || rows.length === 0) {
      console.log("⚠️  No rows found in sheet.");
      return;
    }

    console.log(`📊 ${rows.length} rows found — syncing new items...\n`);

    const creditRepo = AppDataSource.getRepository(Credit);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, string>;

      const rawPurchaseDate = row["Purchase Date"] || row["purchaseDate"] || "";
      const rawValidateDate = row["Validate Date"] || row["validateDate"] || "";
      const rawDescription = row["Description"] || row["description"] || "";
      const rawValue = row["Value"] || row["value"] || "0";
      const rawAccount = row["Account"] || row["account"] || "";
      const rawStatus = row["Status"] || row["status"] || "pending";
      const rawCategory = row["Category"] || row["category"] || "";
      const rawSubcategory = row["Subcategory"] || row["subcategory"] || "";
      const rawTags = row["Tags"] || row["tags"] || "";
      const rawPessoas = row["Pessoas"] || row["pessoas"] || "";
      const rawCard = row["Cartão de credito"] || row["cartaoCredito"] || "";
      const rawObservation = row["Observation"] || row["observation"] || "";

      if (!rawDescription.trim()) {
        console.log(`  ⏭  Row ${i + 2}: empty description — skipped`);
        stats.skipped++;
        continue;
      }

      try {
        const purchaseDateParsed = parseSheetDate(rawPurchaseDate);
        const validateDateParsed = parseSheetDate(rawValidateDate);
        const valueNumber = parseValue(rawValue);

        const alreadyExists = purchaseDateParsed
          ? await creditRepo.findOne({
              where: {
                description: rawDescription.trim(),
                purchaseDate: purchaseDateParsed,
                value: valueNumber as any,
              },
            })
          : null;

        if (alreadyExists) {
          console.log(
            `  ⏭  Row ${
              i + 2
            }: already exists — skipped (${rawDescription.substring(0, 50)})`
          );
          stats.skipped++;
          continue;
        }

        let account: Account | null = null;
        if (rawAccount.trim()) {
          account = (await findOrCreate<Account>(
            Account,
            { name: rawAccount.trim() } as any,
            { type: "bank", status: "active", balance: 0 } as any
          )) as Account;
        }

        let category: Category | null = null;
        if (rawCategory.trim()) {
          category = (await findOrCreate<Category>(
            Category,
            { name: rawCategory.trim() } as any,
            {
              type: "credit",
              subcategory: rawSubcategory.trim() || null,
              isActive: true,
            } as any
          )) as Category;
        }

        const tags = rawTags.trim() ? await resolveTagsFromString(rawTags) : [];

        let person: Person | null = null;
        if (rawPessoas.trim()) {
          person = (await findOrCreate<Person>(
            Person,
            { name: rawPessoas.trim() } as any,
            {
              email: `${rawPessoas
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ".")}@placeholder.local`,
              status: "active",
              isActive: true,
            } as any
          )) as Person;
        }

        let creditCard: CreditCard | null = null;
        if (rawCard.trim()) {
          creditCard = (await findOrCreate<CreditCard>(
            CreditCard,
            { cardholder: rawCard.trim() } as any,
            {
              cardNumber: `****-IMPORT-${rawCard
                .trim()
                .substring(0, 8)
                .toUpperCase()}`,
              bank: rawCard.trim().split(" ")[0],
              status: "active",
              currentBalance: 0,
            } as any
          )) as CreditCard;
        }

        const autoCode = `CREDIT-${rawPurchaseDate.replace(
          /\//g,
          ""
        )}-${rawDescription
          .replace(/\s+/g, "_")
          .substring(0, 20)
          .toUpperCase()}`;

        // ── Insert new credit ────────────────────────────────────────────────
        const credit = creditRepo.create({
          purchaseDate:
            purchaseDateParsed ?? new Date().toISOString().split("T")[0],
          validateDate: validateDateParsed ?? undefined,
          description: rawDescription.trim(),
          value: valueNumber,
          status: rawStatus.trim() || "pending",
          observation: rawObservation.trim() || undefined,
          code: autoCode,
          account: account ?? undefined,
          accountId: account ? (account as any).id : undefined,
          category: category ?? undefined,
          categoryId: category ? (category as any).id : undefined,
          person: person ?? undefined,
          personId: person ? (person as any).id : undefined,
          creditCard: creditCard ?? undefined,
          creditCardId: creditCard ? (creditCard as any).id : undefined,
          tags,
        });

        await creditRepo.save(credit, { reload: false });
        stats.inserted++;
        console.log(
          `  ✅ Row ${i + 2}: inserted — ${rawDescription.substring(0, 50)}`
        );
      } catch (rowError) {
        const msg = `Row ${i + 2} ("${rawDescription.substring(
          0,
          30
        )}"): ${rowError}`;
        stats.errors.push(msg);
        console.error(`  ❌ ${msg}`);
      }
    }
  } catch (fatalError) {
    console.error("\n❌ Fatal error:", fatalError);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log("\n🔌 Database connection closed");
  }

  console.log("\n" + "=".repeat(55));
  console.log("📊  Sync Summary");
  console.log("=".repeat(55));
  console.log(`  ✅ Inserted : ${stats.inserted}`);
  console.log(`  ⏭  Skipped  : ${stats.skipped}`);
  console.log(`  ❌ Errors   : ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    console.log("\n  Error details:");
    stats.errors.forEach((e) => console.log(`    - ${e}`));
  }
  console.log("=".repeat(55));
  process.exit(stats.errors.length > 0 ? 1 : 0);
}

syncNewCreditsFromSheets();
