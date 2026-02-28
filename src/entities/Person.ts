import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Credit } from './Credit';

@Entity('persons')
@Index(['name'])
@Index(['email'])
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 150, unique: true })
  name: string;

  @Column('varchar', { length: 150, nullable: true, unique: true })
  email: string;

  @Column('varchar', { length: 20, nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column('varchar', { length: 100, nullable: true })
  city: string;

  @Column('varchar', { length: 100, nullable: true })
  state: string;

  @Column('varchar', { length: 20, nullable: true })
  zipCode: string;

  @Column('varchar', { length: 50, nullable: true })
  cpf: string; // CPF for Brazilian identification

  @Column('varchar', { length: 50, nullable: true })
  cnpj: string; // CNPJ for Brazilian business identification

  @Column('text', { nullable: true })
  observation: string;

  @Column('varchar', { length: 50, default: 'active' })
  status: string; // active, inactive, archived

  @Column('boolean', { default: true })
  isActive: boolean;

  @OneToMany(() => Credit, (credit) => credit.person, { lazy: true })
  credits: Credit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
