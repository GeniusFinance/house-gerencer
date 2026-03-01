import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "@/src/database/middleware";
import { Credit } from "@/src/entities/Credit";
import { Expense } from "@/src/entities/Expense";
import { Tag } from "@/src/entities/Tag";

export async function POST(request: NextRequest) {
  try {
    const { codigo, type } = (await request.json()) as {
      codigo: string;
      type: "credit" | "expense";
    };

    const codigoArray = codigo
      .split(", ")
      .map((c) => c.trim())
      .filter(Boolean);

    if (codigoArray.length === 0) {
      return NextResponse.json(
        { error: "Código is required" },
        { status: 400 }
      );
    }

    if (!type || (type !== "credit" && type !== "expense")) {
      return NextResponse.json(
        { error: "Type must be either 'credit' or 'expense'" },
        { status: 400 }
      );
    }

    const ds = await ensureDatabase();
    const tagRepo = ds.getRepository(Tag);

    // Find or create the "recebi" tag
    let recebiTag = await tagRepo.findOne({ where: { name: "recebi" } });
    if (!recebiTag) {
      recebiTag = tagRepo.create({ name: "recebi", color: "#22c55e" });
      await tagRepo.save(recebiTag);
    }

    const updated: { code: string }[] = [];
    const notFound: string[] = [];

    if (type === "credit") {
      const creditRepo = ds.getRepository(Credit);
      for (const code of codigoArray) {
        const credit = await creditRepo.findOne({
          where: { code },
          relations: ["tags"],
        });
        if (!credit) {
          console.warn(`Credit not found for code: ${code}`);
          notFound.push(code);
          continue;
        }
        // Remove any "não recebi" variant tags and add "recebi"
        const filtered = (credit.tags ?? []).filter(
          (t) =>
            !["não recebi", "nao recebi", "não-recebi"].includes(
              t.name.toLowerCase()
            )
        );
        const alreadyTagged = filtered.some(
          (t) => t.name.toLowerCase() === "recebi"
        );
        credit.tags = alreadyTagged ? filtered : [...filtered, recebiTag];
        credit.status = "settled";
        await creditRepo.save(credit);
        updated.push({ code });
      }
    } else {
      const expenseRepo = ds.getRepository(Expense);
      for (const code of codigoArray) {
        const expense = await expenseRepo.findOne({ where: { code } });
        if (!expense) {
          console.warn(`Expense not found for code: ${code}`);
          notFound.push(code);
          continue;
        }
        expense.status = "paid";
        await expenseRepo.save(expense);
        updated.push({ code });
      }
    }

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: `No ${type} found with codes: ${codigoArray.join(", ")}`,
          notFound,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${updated.length} ${type}(s) marked as recebi`,
      updates: updated,
      notFound,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
