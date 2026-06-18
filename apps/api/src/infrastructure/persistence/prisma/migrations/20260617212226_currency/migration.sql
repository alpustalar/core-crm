/*
  Warnings:

  - The `currency` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `appointment_procedures` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `default_currency` column on the `clinic_finance_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `finance_ledger` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `hotelbeds_bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `hotelbeds_transfer_bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `journal_lines` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `meta_campaign_metrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `payment_installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `pos_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `product_batches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `product_prices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `purchase_invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `stock_movements` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency";

-- AlterTable
ALTER TABLE "appointment_procedures" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "clinic_finance_settings" DROP COLUMN "default_currency",
ADD COLUMN     "default_currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "finance_ledger" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "hotelbeds_bookings" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'EUR';

-- AlterTable
ALTER TABLE "hotelbeds_transfer_bookings" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'EUR';

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "journal_lines" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "meta_campaign_metrics" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "payment_installments" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "pos_transactions" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "product_batches" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "product_prices" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "purchase_invoices" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';
