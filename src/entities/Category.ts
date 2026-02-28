import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('categories')
@Index(['name', 'type'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('varchar', { length: 50 })
  type: string; // 'expense', 'income', 'credit', 'transfer'

  @Column('varchar', { length: 100, nullable: true })
  subcategory: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 20, nullable: true })
  color: string; // For UI display (hex color code)

  @Column('varchar', { length: 50, nullable: true })
  icon: string; // For UI display (icon name)

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany('Expense', 'category', { lazy: true })
  expenses: object[];

  @OneToMany('Credit', 'category', { lazy: true })
  credits: object[];

  @OneToMany('Income', 'category', { lazy: true })
  incomes: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
