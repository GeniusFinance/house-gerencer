import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayerToIncome1771900000000 implements MigrationInterface {
  name = "AddPayerToIncome1771900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incomes" ADD COLUMN IF NOT EXISTS "payer" character varying(255)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incomes" DROP COLUMN IF EXISTS "payer"`
    );
  }
}
