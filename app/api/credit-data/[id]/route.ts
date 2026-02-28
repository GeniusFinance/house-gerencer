import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Credit } from "@/src/entities/Credit";
import { Account } from "@/src/entities/Account";
import { Category } from "@/src/entities/Category";
import { Tag } from "@/src/entities/Tag";
import { Person } from "@/src/entities/Person";
import { CreditCard } from "@/src/entities/CreditCard";
import { Like, In, DataSource } from "typeorm";

function creditToSheetRow(credit: Credit) {
  const tagNames = credit.tags?.map((t) => t.name.toLowerCase()) ?? [];
  const isRecebi =
    tagNames.includes("recebi") ||
    credit.status === "settled" ||
    credit.status === "completed";

  return {
    id: credit.id,
    purchaseDate: credit.purchaseDate ?? "",
    validateDate: credit.validateDate ?? "",
    description: credit.description,
    value: Number(credit.value),
    account: credit.account?.name ?? "",
    status: credit.status,
    category: credit.category?.name ?? "",
    subcategory: "",
    tags: isRecebi ? "recebi" : tagNames.join(", "),
    pessoas: credit.person?.name ?? "",
    credit: credit.credit ?? "",
    card: credit.creditCard?.cardholder ?? "",
    observation: credit.observation ?? "",
    month: credit.month ?? "",
    year: credit.year ?? "",
    code: credit.code,
    proofUrl: "",
  };
}

const load = (ds: DataSource, id: string) =>
  ds.getRepository(Credit).findOne({
    where: { id },
    relations: ["account", "category", "tags", "person", "creditCard"],
  });

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ds = await ensureDatabase();
    const { id } = await context.params;

    const found = await load(ds, id);
    if (!found) {
      return NextResponse.json({ error: "Credit not found" }, { status: 404 });
    }
    console.log("Fetched credit:", found);
    return NextResponse.json(creditToSheetRow(found));
  } catch (error) {
    console.error("Error fetching credit:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit" },
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
    const repo       = ds.getRepository(Credit);
    const account    = ds.getRepository(Account);
    const category   = ds.getRepository(Category);
    const tag        = ds.getRepository(Tag);
    const person     = ds.getRepository(Person);
    const creditCard = ds.getRepository(CreditCard);
    const { id } = await context.params;

    const found = await load(ds, id);
    if (!found) {
      return NextResponse.json({ error: "Credit not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      purchaseDate,
      validateDate,
      description,
      value,
      accountId,
      accountName,
      status,
      categoryId,
      categoryName,
      tagIds,
      tagNames,
      personId,
      personName,
      creditCardId,
      creditCardName,
      observation,
      month,
      year,
      code,
      creditType,
    } = body;

    if (purchaseDate !== undefined) found.purchaseDate = purchaseDate;
    if (validateDate !== undefined) found.validateDate = validateDate;
    if (description !== undefined) found.description = description;
    if (value !== undefined) found.value = Number(value);
    if (status !== undefined) found.status = status;
    if (observation !== undefined) found.observation = observation;
    if (month !== undefined) found.month = month;
    if (year !== undefined) found.year = year;
    if (code !== undefined) found.code = code;
    if (creditType !== undefined) found.credit = creditType;

    if (accountId) {
      found.accountId = accountId;
    } else if (accountName) {
      const acc = await account.findOne({ where: { name: accountName } });
      if (acc) found.accountId = acc.id;
    }

    if (categoryId) {
      found.categoryId = categoryId;
    } else if (categoryName) {
      const cat = await category.findOne({ where: { name: categoryName } });
      if (cat) found.categoryId = cat.id;
    }

    if (personId) {
      found.personId = personId;
    } else if (personName) {
      const per = await person.findOne({
        where: { name: Like(`%${personName}%`) },
      });
      if (per) found.personId = per.id;
    }

    if (creditCardId) {
      found.creditCardId = creditCardId;
    } else if (creditCardName) {
      const cc = await creditCard.findOne({ where: { cardholder: creditCardName } });
      if (cc) found.creditCardId = cc.id;
    }

    if (tagIds?.length) {
      found.tags = await tag.findBy({ id: In(tagIds) });
    } else if (tagNames?.length) {
      const foundTags = await Promise.all(
        tagNames.map((n: string) => tag.findOne({ where: { name: n } }))
      );
      found.tags = foundTags.filter(Boolean) as any;
    }

    const saved = await repo.save(found);
    const updated = await load(ds, saved.id);

    return NextResponse.json(creditToSheetRow(updated!));
  } catch (error) {
    console.error("Error updating credit:", error);
    return NextResponse.json(
      { error: "Failed to update credit" },
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
    const repo = ds.getRepository(Credit);
    const { id } = await context.params;

    const found = await repo.findOne({ where: { id } });
    if (!found) {
      return NextResponse.json({ error: "Credit not found" }, { status: 404 });
    }

    await repo.remove(found);
    return NextResponse.json({ message: "Credit deleted successfully", id });
  } catch (error) {
    console.error("Error deleting credit:", error);
    return NextResponse.json(
      { error: "Failed to delete credit" },
      { status: 500 }
    );
  }
}
