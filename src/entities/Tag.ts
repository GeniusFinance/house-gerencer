import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany } from 'typeorm';

@Entity('tags')
@Index(['name'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 20, nullable: true })
  color: string; // For UI display (hex color code)

  @Column('boolean', { default: true })
  isActive: boolean;

  @ManyToMany('Expense', 'tags', { lazy: true })
  expenses: object[];

  @ManyToMany('Credit', 'tags', { lazy: true })
  credits: object[];

  @ManyToMany('Income', 'tags', { lazy: true })
  incomes: object[];

  @ManyToMany('Transfer', 'tags', { lazy: true })
  transfers: object[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
