import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Expense } from '../entities/Expense';
import { Credit } from '../entities/Credit';
import { Income } from '../entities/Income';
import { Transfer } from '../entities/Transfer';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import { Person } from '../entities/Person';
import { CreditCard } from '../entities/CreditCard';
import { Budget } from '../entities/Budget';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'debt_tracker',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [Expense, Credit, Income, Transfer, Account, Category, Tag, Person, CreditCard, Budget],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
