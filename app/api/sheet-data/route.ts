import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Credit } from "@/src/entities/Credit";

export async function GET(request: NextRequest) {
  try {
    const ds = await ensureDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const person = searchParams.get("person");

    const qb = ds
      .getRepository(Credit)
      .createQueryBuilder("credit")
      .leftJoinAndSelect("credit.account", "account")
      .leftJoinAndSelect("credit.category", "category")
      .leftJoinAndSelect("credit.tags", "tags")
      .leftJoinAndSelect("credit.person", "person")
      .leftJoinAndSelect("credit.creditCard", "creditCard")
      .orderBy("credit.validateDate", "DESC");

    if (status) {
      qb.andWhere("credit.status = :status", { status });
    }
    if (person) {
      qb.andWhere("LOWER(person.name) = LOWER(:person)", { person });
    }

    const credits = await qb.getMany();

    const rows = credits.map((c) => {
      const tagNames = c.tags?.map((t) => t.name.toLowerCase()) ?? [];
      const isRecebi =
        tagNames.includes("recebi") ||
        c.status === "settled" ||
        c.status === "completed";
      return {
        id: c.id,
        purchaseDate: c.purchaseDate ?? "",
        validateDate: c.validateDate ?? "",
        description: c.description,
        value: Number(c.value),
        account: c.account?.name ?? "",
        status: c.status,
        category: c.category?.name ?? "",
        subcategory: "",
        tags: isRecebi ? "recebi" : tagNames.join(", "),
        pessoas: c.person?.name ?? "",
        credit: c.credit ?? "",
        card: c.creditCard?.cardholder ?? "",
        observation: c.observation ?? "",
        month: c.month ?? "",
        year: c.year ?? "",
        code: c.code,
        proofUrl: "",
      };
    });

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error reading sheet data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
