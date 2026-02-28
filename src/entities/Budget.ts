import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './Category';
import { Account } from './Account';
import { Person } from './Person';

@Entity('budgets')
@Index(['startDate', 'endDate'])
@Index(['category'])
@Index(['status'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 50 })
  type: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number; // Budget limit

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  spent: number; // Amount already spent

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToOne(() => Account, { eager: true, nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column('uuid', { nullable: true })
  accountId: string;

  @ManyToOne(() => Person, { eager: true, nullable: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column('uuid', { nullable: true })
  personId: string;

  @Column('date')
  startDate: string;

  @Column('date', { nullable: true })
  endDate: string;

  @Column('varchar', { length: 50, default: 'active' })
  status: string; // 'active', 'inactive', 'archived', 'exceeded'

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  percentageUsed: number; // Calculated field: (spent / amount) * 100

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
