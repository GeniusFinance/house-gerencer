import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Credit } from './Credit';

@Entity('credit_cards')
@Index(['cardNumber'])
@Index(['cardholder'])
export class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  cardNumber: string; // Last 4 digits or encrypted full number

  @Column('varchar', { length: 100 })
  cardholder: string; // Name on card

  @Column('varchar', { length: 100, nullable: true })
  bank: string; // Bank name (Visa, Mastercard, Elo, etc.)

  @Column('varchar', { length: 50, nullable: true })
  brand: string; // visa, mastercard, elo, amex

  @Column('varchar', { length: 10, nullable: true })
  expiryDate: string; // MM/YY format

  @Column('varchar', { length: 50, default: 'active' })
  status: string; // active, inactive, expired, blocked

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  creditLimit: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentBalance: number;

  @Column('varchar', { length: 50, nullable: true })
  dueDay: string; // Day of month when bill is due

  @Column('varchar', { length: 50, nullable: true })
  statementDay: string; // Day of month when statement closes

  @Column('text', { nullable: true })
  observation: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => Credit, (credit) => credit.creditCard, { lazy: true })
  credits: Credit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
