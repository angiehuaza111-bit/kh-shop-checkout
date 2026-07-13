import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783648900000 implements MigrationInterface {
  name = 'InitialSchema1783648900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('ADMIN')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'ADMIN',
        "refresh_token_hash" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL,
        "name" varchar(150) NOT NULL,
        "description" text,
        "price_in_cents" integer NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'COP',
        "stock" integer NOT NULL,
        "image_url" varchar(500),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_products" PRIMARY KEY ("id"),
        CONSTRAINT "chk_products_price_positive" CHECK ("price_in_cents" > 0),
        CONSTRAINT "chk_products_stock_non_negative" CHECK ("stock" >= 0)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_products_is_active" ON "products" ("is_active")
    `);

    await queryRunner.query(`
      CREATE TYPE "transactions_status_enum" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'ERROR')
    `);
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL,
        "reference" varchar(64) NOT NULL,
        "status" "transactions_status_enum" NOT NULL DEFAULT 'PENDING',
        "amount_in_cents" integer NOT NULL,
        "currency" varchar(3) NOT NULL,
        "customer_email" varchar(255) NOT NULL,
        "gateway_transaction_id" varchar(100),
        "card_last_four" varchar(4),
        "card_brand" varchar(20),
        "failure_reason" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_transactions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_transactions_reference" ON "transactions" ("reference")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_transactions_status" ON "transactions" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_transactions_customer_email" ON "transactions" ("customer_email")
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction_items" (
        "id" uuid NOT NULL,
        "transaction_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price_in_cents" integer NOT NULL,
        "subtotal_in_cents" integer NOT NULL,
        CONSTRAINT "pk_transaction_items" PRIMARY KEY ("id"),
        CONSTRAINT "chk_transaction_items_quantity_positive" CHECK ("quantity" > 0),
        CONSTRAINT "fk_transaction_items_transaction" FOREIGN KEY ("transaction_id")
          REFERENCES "transactions" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_transaction_items_product" FOREIGN KEY ("product_id")
          REFERENCES "products" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_transaction_items_transaction_id" ON "transaction_items" ("transaction_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_transaction_items_product_id" ON "transaction_items" ("product_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "webhook_events" (
        "id" uuid NOT NULL,
        "provider_event_id" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL,
        "signature_valid" boolean NOT NULL,
        "processed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_webhook_events" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_webhook_events_provider_event_id" ON "webhook_events" ("provider_event_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhook_events"`);
    await queryRunner.query(`DROP TABLE "transaction_items"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "transactions_status_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
