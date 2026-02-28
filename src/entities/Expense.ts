import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Account } from './Account';
import { Category } from './Category';
import { Tag } from './Tag';

@Entity('expenses')
@Index(['date'])
@Index(['status'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: string;

  @Column('varchar', { length: 255 })
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @ManyToOne(() => Account, (account) => account.expenses, { eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column('uuid', { nullable: true })
  accountId: string;

  @Column('varchar', { length: 50, default: 'pending' })
  status: string; // pending, completed, cancelled

  @ManyToOne(() => Category, (category) => category.expenses, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToMany(() => Tag, (tag) => tag.expenses, { eager: true })
  @JoinTable({
    name: 'expense_tags',
    joinColumn: { name: 'expenseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column('varchar', { length: 50 })
  code: string;

  @Column('varchar', { length: 50, nullable: true })
  month: string;

  @Column('varchar', { length: 50, nullable: true })
  year: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
