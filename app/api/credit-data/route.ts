import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Credit } from "@/src/entities/Credit";
import { Account } from "@/src/entities/Account";
import { Category } from "@/src/entities/Category";
import { Tag } from "@/src/entities/Tag";
import { Person } from "@/src/entities/Person";
import { CreditCard } from "@/src/entities/CreditCard";
import { Like, In } from "typeorm";

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

export async function GET(request: NextRequest) {
  try {
    const ds = await ensureDatabase();
    const repo = ds.getRepository(Credit);

    const { searchParams } = new URL(request.url);
    const personName = searchParams.get("person");
    const personId = searchParams.get("personId");
    const status = searchParams.get("status");
    const tagFilter = searchParams.get("tagFilter"); 
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const qb = repo
      .createQueryBuilder("credit")
      .leftJoinAndSelect("credit.account", "account")
      .leftJoinAndSelect("credit.category", "category")
      .leftJoinAndSelect("credit.tags", "tags")
      .leftJoinAndSelect("credit.person", "person")
      .leftJoinAndSelect("credit.creditCard", "creditCard");


    
    if (personName) {
      qb.andWhere("LOWER(person.name) = LOWER(:personName)", { personName });
    }

    if (personId) {
      qb.andWhere("credit.personId = :personId", { personId });
    }

    if (status) {
      qb.andWhere("credit.status = :status", { status });
    }

    if (startDate) {
      qb.andWhere("credit.validateDate >= :startDate", { startDate });
    }

    if (endDate) {
      qb.andWhere("credit.validateDate <= :endDate", { endDate });
    }

    if (tagFilter === "recebi") {
      qb.andWhere("(tags.name = 'recebi' OR credit.status IN ('settled','completed'))");
    } else if (tagFilter === "not-recebi") {
      qb.andWhere(
        "(tags.name IS NULL OR tags.name != 'recebi') AND credit.status NOT IN ('settled','completed')"
      );
    }

    qb.orderBy("credit.validateDate", "DESC");

    const credits = await qb.getMany();
    console.log(`Fetched ${credits.length} credits with filters - personName: ${personName}, personId: ${personId}, status: ${status}, tagFilter: ${tagFilter}, startDate: ${startDate}, endDate: ${endDate}`);
    const rows = credits.map(creditToSheetRow);

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ds = await ensureDatabase();
    const repo         = ds.getRepository(Credit);
    const account      = ds.getRepository(Account);
    const category     = ds.getRepository(Category);
    const tag          = ds.getRepository(Tag);
    const person       = ds.getRepository(Person);
    const creditCard   = ds.getRepository(CreditCard);

    const body = await request.json();
    const {
      purchaseDate,
      validateDate,
      description,
      value,
      accountId,
      accountName,
      status = "pending",
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

    if (!description || value === undefined || !code) {
      return NextResponse.json(
        { error: "description, value and code are required" },
        { status: 400 }
      );
    }

    const newCredit = repo.create({
      purchaseDate,
      validateDate,
      description,
      value: Number(value),
      status,
      observation,
      month,
      year,
      code,
      credit: creditType,
    });

    if (accountId) {
      newCredit.accountId = accountId;
    } else if (accountName) {
      const acc = await account.findOne({ where: { name: accountName } });
      if (acc) newCredit.accountId = acc.id;
    }

    if (categoryId) {
      newCredit.categoryId = categoryId;
    } else if (categoryName) {
      const cat = await category.findOne({ where: { name: categoryName } });
      if (cat) newCredit.categoryId = cat.id;
    }

    if (personId) {
      newCredit.personId = personId;
    } else if (personName) {
      const per = await person.findOne({
        where: { name: Like(`%${personName}%`) },
      });
      if (per) newCredit.personId = per.id;
    }

    if (creditCardId) {
      newCredit.creditCardId = creditCardId;
    } else if (creditCardName) {
      const cc = await creditCard.findOne({
        where: { cardholder: creditCardName },
      });
      if (cc) newCredit.creditCardId = cc.id;
    }

    if (tagIds?.length) {
      newCredit.tags = await tag.findBy({ id: In(tagIds) });
    } else if (tagNames?.length) {
      const foundTags = await Promise.all(
        tagNames.map((n: string) => tag.findOne({ where: { name: n } }))
      );
      newCredit.tags = foundTags.filter(Boolean) as any;
    }

    const saved = await repo.save(newCredit);
    const loaded = await repo.findOne({
      where: { id: saved.id },
      relations: ["account", "category", "tags", "person", "creditCard"],
    });

    return NextResponse.json(creditToSheetRow(loaded!), { status: 201 });
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json(
      { error: "Failed to create credit" },
      { status: 500 }
    );
  }
}
