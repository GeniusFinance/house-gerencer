import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Expense, Credit, Income, Transfer, Account, Category, Tag, Person, CreditCard, Budget } from '@/src/entities';
import { Migration1771781597053 } from './migrations/1771781597053-Migration';
import { AddPayerToIncome1771900000000 } from './migrations/1771900000000-AddPayerToIncome';

export function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'debt_tracker',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.DB_LOGGING === 'true',
    entities: [Expense, Credit, Income, Transfer, Account, Category, Tag, Person, CreditCard, Budget],
    migrations: [Migration1771781597053, AddPayerToIncome1771900000000],
    subscribers: [],
    extra: {
      max: 10,
      min: 1,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
    },
  });
}

export const AppDataSource: DataSource = createDataSource();


export async function initializeDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully!');
  }
  return AppDataSource;
}


export async function closeDataSource() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('❌ Database connection closed');
  }
}
