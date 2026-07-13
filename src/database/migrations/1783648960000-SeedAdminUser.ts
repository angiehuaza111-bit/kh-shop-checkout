import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminUser1783648960000 implements MigrationInterface {
  name = 'SeedAdminUser1783648960000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_SEED_EMAIL;
    const password = process.env.ADMIN_SEED_PASSWORD;

    if (!email || !password) {
      console.warn(
        'Skipping admin seed: ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD are not set in the environment.',
      );
      return;
    }

    const passwordHash = await argon2.hash(password);

    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "password_hash", "role", "is_active")
       VALUES ($1, $2, $3, 'ADMIN', true)
       ON CONFLICT ("email") DO NOTHING`,
      [randomUUID(), email, passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.ADMIN_SEED_EMAIL;
    if (!email) {
      return;
    }
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [email]);
  }
}
