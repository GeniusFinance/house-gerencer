export interface SheetRow {
  purchaseDate: string;
  validateDate: string;
  description: string;
  value: number;
  account: string;
  status: string;
  category: string;
  subcategory: string;
  tags: string;
  pessoas: string; // People - user name
  credit: string;
  card: string;
  observation: string;
  month: string;
  year: string;
  proofUrl?: string; 
  relatedCreditId?: string; 
}

export interface OweSummary {
  user: string;
  totalOwed: number;
  items: SheetRow[];
}

export interface IncomeRow {
  date: string;
  description: string;
  value: number;
  account: string;
  status: string;
  category: string;
  subcategory: string;
  tags: string;
  proofUrl?: string; 
  relatedCreditId?: string;
  observation: string;
  month: string;
  year: string;
}
