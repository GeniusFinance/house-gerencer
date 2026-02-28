import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Person } from './Person';
import { CreditCard } from './CreditCard';
import { Account } from './Account';
import { Category } from './Category';
import { Tag } from './Tag';

@Entity('credits')
@Index(['purchaseDate'])
@Index(['status'])
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  purchaseDate: string;

  @Column('date', { nullable: true })
  validateDate: string;

  @Column('varchar', { length: 255 })
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @ManyToOne(() => Account, (account) => account.credits, { eager: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column('uuid', { nullable: true })
  accountId: string;

  @Column('varchar', { length: 50, default: 'pending' })
  status: string; // pending, completed, cancelled, settled

  @ManyToOne(() => Category, (category) => category.credits, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToMany(() => Tag, (tag) => tag.credits, { eager: true })
  @JoinTable({
    name: 'credit_tags',
    joinColumn: { name: 'creditId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToOne(() => Person, (person) => person.credits, { eager: true })
  @JoinColumn({ name: 'personId' })
  person: Person; // Person who owes the money

  @Column('uuid', { nullable: true })
  personId: string;

  @Column('varchar', { length: 100, nullable: true })
  credit: string;

  @ManyToOne(() => CreditCard, (creditCard) => creditCard.credits, { eager: true, nullable: true })
  @JoinColumn({ name: 'creditCardId' })
  creditCard: CreditCard;

  @Column('uuid', { nullable: true })
  creditCardId: string;

  @Column('text', { nullable: true })
  observation: string;

  @Column('varchar', { length: 50, nullable: true })
  month: string;

  @Column('varchar', { length: 50, nullable: true })
  year: string;

  @Column('varchar', { length: 50 })
  code: string;

  @Column('varchar', { length: 500, nullable: true })
  proofUrl: string;

  @Column('uuid', { nullable: true })
  relatedCreditId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
