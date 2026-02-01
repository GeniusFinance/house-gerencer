import { SheetRow } from "@/types/sheet";

/**
 * Parse currency value handling both Brazilian (1.234,56) and US (1,234.56) formats
 */
function parseFloatValue(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const stringValue = String(value).trim();
  
  // Check if it's Brazilian format (comma as decimal separator)
  if (stringValue.includes(',') && stringValue.lastIndexOf(',') > stringValue.lastIndexOf('.')) {
    // Brazilian format: 1.234,56
    return parseFloat(stringValue.replace(/\./g, '').replace(',', '.'));
  }
  
  // US format or simple number: 1,234.56 or 1234.56
  return parseFloat(stringValue.replace(/,/g, ''));
}

/**
 * Parse CSV data from a sheet into typed SheetRow objects
 */
export function parseSheetData(rawData: any[]): SheetRow[] {
  return rawData.map((row) => ({
    purchaseDate: row["Purchase Date"] || row.purchaseDate || "",
    validateDate: row["Validate Date"] || row.validateDate || "",
    description: row["Description"] || row.description || "",
    value: parseFloatValue(row["Value"] || row.value || "0"),
    account: row["Account"] || row.account || "",
    status: row["Status"] || row.status || "",
    category: row["Category"] || row.category || "",
    subcategory: row["Subcategory"] || row.subcategory || "",
    tags: row["Recebi"] || row["Tags"] || row.tags || "", // Prioritize "Recebi" for credit sheet
    pessoas: row["Pessoas"] || row.pessoas || "",
    credit: row["Credit"] || row.credit || "",
    card: row["Card"] || row.card || "",
    observation: row["Observation"] || row.observation || "",
    month: row["Month"] || row.month || "",
    year: row["Year"] || row.year || "",
    code: row["code"] || row.codigo || "",
  }));
}

export function filterByUser(data: SheetRow[], userName: string): SheetRow[] {
  if (!userName) return data;

  const normalizedUserName = userName.toLowerCase().trim();
  return data.filter((row) => {
    const rowUser = row.pessoas.toLowerCase().trim();
    return rowUser === normalizedUserName;
  });
}

/**
 * Filter data by month and year
 */
export function filterByMonth(data: SheetRow[], month: string, year: string): SheetRow[] {
  if (!month || !year) return data;
  
  return data.filter((row) => {
    const rowMonth = row.month?.toLowerCase().trim();
    const rowYear = row.year?.toLowerCase().trim();
    
    return rowMonth === month.toLowerCase().trim() && rowYear === year.trim();
  });
}

/**
 * Group data by user (pessoas)
 */
export function groupByUser(data: SheetRow[]): Map<string, SheetRow[]> {
  const grouped = new Map<string, SheetRow[]>();
  
  data.forEach((row) => {
    const user = row.pessoas || 'Unknown';
    if (!grouped.has(user)) {
      grouped.set(user, []);
    }
    grouped.get(user)!.push(row);
  });
  
  return grouped;
}

/**
 * Calculate total owed from filtered data
 */
export function calculateTotal(data: SheetRow[]): number {
  return data.reduce((sum, row) => {
    if (row.status.toLowerCase() === "paid") {
      return sum;
    }
    return sum + row.value;
  }, 0);
}

/**
 * Format currency for display
 */
export function formatCurrency(
  value: number,
  locale: string = "pt-BR",
  currency: string = "BRL"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

/**
 * Get month name from number or text
 */
export function getMonthName(month: string): string {
  const months: { [key: string]: string } = {
    '01': 'Janeiro', 'january': 'Janeiro', 'janeiro': 'Janeiro',
    '02': 'Fevereiro', 'february': 'Fevereiro', 'fevereiro': 'Fevereiro',
    '03': 'Março', 'march': 'Março', 'março': 'Março',
    '04': 'Abril', 'april': 'Abril', 'abril': 'Abril',
    '05': 'Maio', 'may': 'Maio', 'maio': 'Maio',
    '06': 'Junho', 'june': 'Junho', 'junho': 'Junho',
    '07': 'Julho', 'july': 'Julho', 'julho': 'Julho',
    '08': 'Agosto', 'august': 'Agosto', 'agosto': 'Agosto',
    '09': 'Setembro', 'september': 'Setembro', 'setembro': 'Setembro',
    '10': 'Outubro', 'october': 'Outubro', 'outubro': 'Outubro',
    '11': 'Novembro', 'november': 'Novembro', 'novembro': 'Novembro',
    '12': 'Dezembro', 'december': 'Dezembro', 'dezembro': 'Dezembro',
  };
  
  return months[month.toLowerCase()] || month;
}

/**
 * Sort data by different criteria
 */
export type SortOption = 'date-desc' | 'date-asc' | 'value-desc' | 'value-asc' | 'category' | 'status';

export function sortData(data: SheetRow[], sortBy: SortOption): SheetRow[] {
  const sorted = [...data];
  
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.purchaseDate || '').getTime();
        const dateB = new Date(b.purchaseDate || '').getTime();
        return dateB - dateA;
      });
    case 'date-asc':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.purchaseDate || '').getTime();
        const dateB = new Date(b.purchaseDate || '').getTime();
        return dateA - dateB;
      });
    case 'value-desc':
      return sorted.sort((a, b) => b.value - a.value);
    case 'value-asc':
      return sorted.sort((a, b) => a.value - b.value);
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    default:
      return sorted;
  }
}
