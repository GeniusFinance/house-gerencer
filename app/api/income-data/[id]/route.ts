import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Income } from "@/src/entities/Income";
import { Account } from "@/src/entities/Account";
import { Category } from "@/src/entities/Category";
import { Like } from "typeorm";

function incomeToRow(income: Income) {
  return {
    id: income.id,
    date: income.date,
    description: income.description,
    value: Number(income.value),
    account: income.account?.name ?? "",
    status: income.status,
    category: income.category?.name ?? "",
    tags: income.payer ?? "",
    proofUrl: income.proofUrl ?? "",
    relatedCreditId: income.codigoRelacao ?? "",
    observation: income.observation ?? "",
    month: income.month ?? "",
    year: income.year ?? "",
    payer: income.payer ?? "",
  };
}

const load = async (ds: Awaited<ReturnType<typeof ensureDatabase>>, id: string) =>
  ds.getRepository(Income).findOne({
    where: { id },
    relations: ["account", "category", "tags"],
  });

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ds = await ensureDatabase();
    const { id } = await context.params;

    const income = await load(ds, id);
    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }
    return NextResponse.json(incomeToRow(income));
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ds = await ensureDatabase();
    const repo = ds.getRepository(Income);
    const accountRepo = ds.getRepository(Account);
    const categoryRepo = ds.getRepository(Category);
    const { id } = await context.params;

    const found = await load(ds, id);
    if (!found) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      date,
      description,
      value,
      accountId,
      accountName,
      categoryId,
      categoryName,
      status,
      payer,
      proofUrl,
      codigoRelacao,
      observation,
      month,
      year,
    } = body;

    if (date !== undefined) found.date = date;
    if (description !== undefined) found.description = description;
    if (value !== undefined) found.value = Number(value);
    if (status !== undefined) found.status = status;
    if (payer !== undefined) found.payer = payer;
    if (proofUrl !== undefined) found.proofUrl = proofUrl;
    if (codigoRelacao !== undefined) found.codigoRelacao = codigoRelacao;
    if (observation !== undefined) found.observation = observation;
    if (month !== undefined) found.month = month;
    if (year !== undefined) found.year = year;

    if (accountId) {
      found.accountId = accountId;
    } else if (accountName) {
      const acc = await accountRepo.findOne({
        where: { name: Like(`%${accountName}%`) },
      });
      if (acc) found.accountId = acc.id;
    }

    if (categoryId) {
      found.categoryId = categoryId;
    } else if (categoryName) {
      const cat = await categoryRepo.findOne({
        where: { name: Like(`%${categoryName}%`) },
      });
      if (cat) found.categoryId = cat.id;
    }

    const saved = await repo.save(found);
    const updated = await load(ds, saved.id);

    return NextResponse.json(incomeToRow(updated!));
  } catch (error) {
    console.error("Error updating income:", error);
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ds = await ensureDatabase();
    const repo = ds.getRepository(Income);
    const { id } = await context.params;

    const found = await repo.findOne({ where: { id } });
    if (!found) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    await repo.remove(found);
    return NextResponse.json({ message: "Income deleted successfully", id });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}
