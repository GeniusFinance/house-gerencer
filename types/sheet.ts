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
  code: string; 
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
  codigoRelacao?: string; // Código Relacao - links to Credit or Expense
  observation: string;
  month: string;
  year: string;
}

export interface ExpenseRow {
  date: string;
  description: string;
  value: number;
  account: string;
  status: string;
  category: string;
  subcategory: string;
  tags: string;
  code: string;
}

export interface TransferRow {
  date: string;
  contaOrigem: string; // Source account
  contaDestino: string; // Destination account
  value: number;
  tags: string;
}

export interface DashboardData {
  totalToReceive: number;
  totalToPay: number;
  expenses: ExpenseRow[];
  credits: SheetRow[];
  incomes: IncomeRow[];
  transfers: TransferRow[];
  projectionData: ProjectionData[];
}

export interface ProjectionData {
  date: string;
  toReceive: number;
  toPay: number;
  balance: number;
}
