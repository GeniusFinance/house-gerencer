import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Income } from "@/src/entities/Income";
import { Credit } from "@/src/entities/Credit";
import { Account } from "@/src/entities/Account";
import { Category } from "@/src/entities/Category";
import { Like } from "typeorm";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function incomeToRow(income: Income) {
  return {
    id: income.id,
    date: income.date,
    description: income.description,
    value: Number(income.value),
    account: income.account?.name ?? "",
    status: income.status,
    category: income.category?.name ?? "",
    // "tags" is intentionally the payer name — the frontend uses income.tags to match payer
    tags: income.payer ?? "",
    proofUrl: income.proofUrl ?? "",
    relatedCreditId: income.codigoRelacao ?? "",
    observation: income.observation ?? "",
    month: income.month ?? "",
    year: income.year ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const ds = await ensureDatabase();
    const repo = ds.getRepository(Income);

    const { searchParams } = new URL(request.url);
    const payer = searchParams.get("payer");

    const qb = repo
      .createQueryBuilder("income")
      .leftJoinAndSelect("income.account", "account")
      .leftJoinAndSelect("income.category", "category")
      .leftJoinAndSelect("income.tags", "tags")
      .orderBy("income.date", "DESC");

    if (payer) {
      qb.andWhere("LOWER(income.payer) = LOWER(:payer)", { payer });
    }

    const incomes = await qb.getMany();

    return NextResponse.json(incomes.map(incomeToRow), {
      headers: NO_CACHE_HEADERS,
    });
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
    const ds = await ensureDatabase();
    const incomeRepo = ds.getRepository(Income);
    const creditRepo = ds.getRepository(Credit);
    const accountRepo = ds.getRepository(Account);
    const categoryRepo = ds.getRepository(Category);

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
      observation?: string;
      type?: "credit" | "expense";
    };

    if (!incomeData.value) {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 }
      );
    }

    const codes = incomeData.codigoRelacao
      ?.split(", ")
      .map((c) => c.trim())
      .filter(Boolean);

    // Parse date from "DD/MM/YYYY" → "YYYY-MM-DD"
    const rawDate =
      incomeData.date || new Date().toLocaleDateString("pt-BR");
    let isoDate: string;
    try {
      const parts = rawDate.split("/");
      isoDate =
        parts.length === 3
          ? `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
              2,
              "0"
            )}`
          : new Date().toISOString().split("T")[0];
    } catch {
      isoDate = new Date().toISOString().split("T")[0];
    }

    const newIncome = incomeRepo.create({
      date: isoDate,
      description: incomeData.description || "",
      value: Number(incomeData.value),
      status: "completed",
      payer: incomeData.payer || "",
      proofUrl: incomeData.proofUrl || "",
      codigoRelacao: codes ? codes.join(", ") : "",
      observation: incomeData.observation || "",
    });

    const accountEntity = await accountRepo.findOne({
      where: { name: Like(`%${incomeData.account || "Nubank"}%`) },
    });
    if (accountEntity) newIncome.accountId = accountEntity.id;

    const categoryEntity = await categoryRepo.findOne({
      where: { name: Like(`%${incomeData.category || "Income"}%`) },
    });
    if (categoryEntity) newIncome.categoryId = categoryEntity.id;

    await incomeRepo.save(newIncome);

    // Mark each linked Credit as settled
    if (codes && codes.length > 0) {
      await Promise.all(
        codes.map(async (code) => {
          const credit = await creditRepo.findOne({
            where: { code },
            relations: ["tags"],
          });
          if (!credit) {
            console.warn(`No credit found with code: ${code}`);
            return;
          }
          credit.status = "settled";
          await creditRepo.save(credit);
        })
      );
    }

    const loaded = await incomeRepo.findOne({
      where: { id: newIncome.id },
      relations: ["account", "category", "tags"],
    });

    return NextResponse.json(
      { success: true, income: incomeToRow(loaded!) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering income:", error);
    return NextResponse.json(
      { error: "Failed to register income" },
      { status: 500 }
    );
  }
}
