import { AppDataSource } from "../../connection";

export function parseSheetDate(raw: string): string | null {
  if (!raw || raw.trim() === "") return null;

  const dmy = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10);
    let year = parseInt(dmy[3], 10);
    if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }

  const iso = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw.trim();

  return null;
}

export function parseValue(raw: string | number): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  const s = String(raw).trim();
  if (s.includes(",") && s.lastIndexOf(",") > s.lastIndexOf(".")) {
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(s.replace(/,/g, "")) || 0;
}

export async function findOrCreate<T extends object>(
  EntityClass: new () => T,
  where: Partial<T>,
  defaults: Partial<T>
): Promise<T> {
  const repo = AppDataSource.getRepository<T>(EntityClass);
  let entity: T | null = await repo.findOne({ where: where as any });
  if (!entity) {
    entity = repo.create({ ...where, ...defaults } as any) as unknown as T;
    await repo.save(entity as any);
  }
  return entity as T;
}
