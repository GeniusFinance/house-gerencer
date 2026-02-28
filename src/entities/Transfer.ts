import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Account } from './Account';
import { Tag } from './Tag';

@Entity('transfers')
@Index(['date'])
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: string;

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn({ name: 'sourceAccountId' })
  sourceAccount: Account; // Source account

  @Column('uuid')
  sourceAccountId: string;

  @ManyToOne(() => Account, { eager: true })
  @JoinColumn({ name: 'destinationAccountId' })
  destinationAccount: Account; // Destination account

  @Column('uuid')
  destinationAccountId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @ManyToMany(() => Tag, (tag) => tag.transfers, { eager: true })
  @JoinTable({
    name: 'transfer_tags',
    joinColumn: { name: 'transferId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
