import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Account } from './Account';
import { Category } from './Category';
import { Tag } from './Tag';

@Entity('incomes')
@Index(['date'])
@Index(['status'])
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: string;

  @Column('varchar', { length: 255 })
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @ManyToOne(() => Account, (account) => account.incomes, { eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column('uuid', { nullable: true })
  accountId: string;

  @Column('varchar', { length: 50, default: 'pending' })
  status: string; // pending, completed, cancelled

  @ManyToOne(() => Category, (category) => category.incomes, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToMany(() => Tag, (tag) => tag.incomes, { eager: true })
  @JoinTable({
    name: 'income_tags',
    joinColumn: { name: 'incomeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column('varchar', { length: 500, nullable: true })
  proofUrl: string;

  @Column('varchar', { length: 100, nullable: true })
  codigoRelacao: string; // Código Relação - links to Credit or Expense

  @Column('text', { nullable: true })
  observation: string;

  @Column('varchar', { length: 50, nullable: true })
  month: string;

  @Column('varchar', { length: 50, nullable: true })
  year: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
