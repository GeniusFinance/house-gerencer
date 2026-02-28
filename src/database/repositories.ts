import { AppDataSource } from './connection';
import { Expense } from '@/src/entities/Expense';
import { Credit } from '@/src/entities/Credit';
import { Income } from '@/src/entities/Income';
import { Transfer } from '@/src/entities/Transfer';
import { Account } from '@/src/entities/Account';
import { Category } from '@/src/entities/Category';
import { Tag } from '@/src/entities/Tag';
import { Person } from '@/src/entities/Person';
import { CreditCard } from '@/src/entities/CreditCard';
import { Budget } from '@/src/entities/Budget';

export const getRepositories = () => ({
  expense: AppDataSource.getRepository(Expense),
  credit: AppDataSource.getRepository(Credit),
  income: AppDataSource.getRepository(Income),
  transfer: AppDataSource.getRepository(Transfer),
  account: AppDataSource.getRepository(Account),
  category: AppDataSource.getRepository(Category),
  tag: AppDataSource.getRepository(Tag),
  person: AppDataSource.getRepository(Person),
  creditCard: AppDataSource.getRepository(CreditCard),
  budget: AppDataSource.getRepository(Budget),
});

export type Repositories = ReturnType<typeof getRepositories>;
