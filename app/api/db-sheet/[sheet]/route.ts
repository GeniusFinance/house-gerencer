import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ sheet: string }> };

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

async function queryExpenses() {
  const { initializeDataSource } = await import('@/src/database/connection');
  const { Expense } = await import('@/src/entities/Expense');
  const ds = await initializeDataSource();
  const records = await ds.getRepository(Expense).find({
    order: { date: 'DESC' },
    relations: ['category', 'account'],
  });
  const columns = ['id', 'date', 'description', 'category', 'value', 'status', 'account', 'month', 'year', 'code'];
  const rows = records.map((r) => ({
    id: r.id,
    values: {
      id: r.id,
      date: r.date,
      description: r.description,
      category: r.category?.name ?? '',
      value: str(r.value),
      status: r.status,
      account: r.account?.name ?? '',
      month: r.month ?? '',
      year: r.year ?? '',
      code: r.code,
    },
  }));
  return { columns, rows };
}

async function queryIncomes() {
  const { initializeDataSource } = await import('@/src/database/connection');
  const { Income } = await import('@/src/entities/Income');
  const ds = await initializeDataSource();
  const records = await ds.getRepository(Income).find({
    order: { date: 'DESC' },
    relations: ['category', 'account'],
  });
  const columns = ['id', 'date', 'description', 'value', 'account', 'status', 'category', 'month', 'year'];
  const rows = records.map((r) => ({
    id: r.id,
    values: {
      id: r.id,
      date: r.date,
      description: r.description,
      value: str(r.value),
      account: r.account?.name ?? '',
      status: r.status,
      category: r.category?.name ?? '',
      month: r.month ?? '',
      year: r.year ?? '',
    },
  }));
  return { columns, rows };
}

async function queryCredits() {
  const { initializeDataSource } = await import('@/src/database/connection');
  const { Credit } = await import('@/src/entities/Credit');
  const ds = await initializeDataSource();
  const records = await ds.getRepository(Credit).find({
    order: { purchaseDate: 'DESC' },
    relations: ['category', 'account', 'person', 'creditCard'],
  });
  const columns = ['id', 'purchaseDate', 'description', 'value', 'status', 'category', 'person', 'creditCard', 'account', 'month', 'year', 'code'];
  const rows = records.map((r) => ({
    id: r.id,
    values: {
      id: r.id,
      purchaseDate: r.purchaseDate,
      description: r.description,
      value: str(r.value),
      status: r.status,
      category: r.category?.name ?? '',
      person: r.person?.name ?? '',
      creditCard: r.creditCard?.cardholder ?? '',
      account: r.account?.name ?? '',
      month: r.month ?? '',
      year: r.year ?? '',
      code: r.code,
    },
  }));
  return { columns, rows };
}

async function queryTransfers() {
  const { initializeDataSource } = await import('@/src/database/connection');
  const { Transfer } = await import('@/src/entities/Transfer');
  const ds = await initializeDataSource();
  const records = await ds.getRepository(Transfer).find({
    order: { date: 'DESC' },
    relations: ['sourceAccount', 'destinationAccount'],
  });
  const columns = ['id', 'date', 'sourceAccount', 'destinationAccount', 'value'];
  const rows = records.map((r) => ({
    id: r.id,
    values: {
      id: r.id,
      date: r.date,
      sourceAccount: r.sourceAccount?.name ?? '',
      destinationAccount: r.destinationAccount?.name ?? '',
      value: str(r.value),
    },
  }));
  return { columns, rows };
}

async function queryBudgets() {
  const { initializeDataSource } = await import('@/src/database/connection');
  const { Budget } = await import('@/src/entities/Budget');
  const ds = await initializeDataSource();
  const records = await ds.getRepository(Budget).find({
    order: { startDate: 'DESC' },
    relations: ['category', 'account', 'person'],
  });
  const columns = ['id', 'name', 'type', 'amount', 'spent', 'percentageUsed', 'status', 'category', 'account', 'person', 'startDate', 'endDate'];
  const rows = records.map((r) => ({
    id: r.id,
    values: {
      id: r.id,
      name: r.name,
      type: r.type,
      amount: str(r.amount),
      spent: str(r.spent),
      percentageUsed: str(r.percentageUsed),
      status: r.status,
      category: r.category?.name ?? '',
      account: r.account?.name ?? '',
      person: r.person?.name ?? '',
      startDate: r.startDate,
      endDate: r.endDate ?? '',
    },
  }));
  return { columns, rows };
}


export async function GET(_req: NextRequest, { params }: Params) {
  const { sheet } = await params;

  try {
    let result: { columns: string[]; rows: { id: string; values: Record<string, string> }[] };

    switch (sheet) {
      case 'Expenses':
        result = await queryExpenses();
        break;
      case 'Incomes':
        result = await queryIncomes();
        break;
      case 'Credit':
        result = await queryCredits();
        break;
      case 'Transfers':
        result = await queryTransfers();
        break;
      case 'Orçamento':
        result = await queryBudgets();
        break;
      default:
        result = { columns: ['sheet'], rows: [{ id: '1', values: { sheet: `${sheet} has no data source yet` } }] };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[db-sheet] Error loading "${sheet}":`, error);
    return NextResponse.json(
      { error: `Failed to load ${sheet}` },
      { status: 500 },
    );
  }
}
