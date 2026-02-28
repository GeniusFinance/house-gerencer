import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('accounts')
@Index(['name', 'type'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('varchar', { length: 50 })
  type: string; // 'bank', 'credit_card', 'cash', 'wallet', etc.

  @Column('varchar', { length: 50, default: 'active' })
  status: string; // active, inactive, archived

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column('varchar', { length: 100, nullable: true })
  institution: string; // Bank name, credit card issuer, etc.

  @Column('varchar', { length: 50, nullable: true })
  accountNumber: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany('Expense', 'account', { lazy: true })
  expenses: object[];

  @OneToMany('Credit', 'account', { lazy: true })
  credits: object[];

  @OneToMany('Income', 'account', { lazy: true })
  incomes: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
