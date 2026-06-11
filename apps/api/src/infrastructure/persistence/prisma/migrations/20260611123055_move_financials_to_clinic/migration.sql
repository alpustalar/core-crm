-- DropForeignKey
ALTER TABLE "accounting_periods" DROP CONSTRAINT "accounting_periods_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_events" DROP CONSTRAINT "financial_events_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "parties" DROP CONSTRAINT "parties_organization_id_fkey";

-- DropIndex
DROP INDEX "accounting_periods_organization_id_year_key";

-- DropIndex
DROP INDEX "accounts_organization_id_code_key";

-- DropIndex
DROP INDEX "accounts_organization_id_parent_id_idx";

-- DropIndex
DROP INDEX "parties_organization_id_origin_type_origin_id_key";

-- AlterTable
ALTER TABLE "accounting_periods" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "financial_events" ALTER COLUMN "clinic_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "journal_entries" ALTER COLUMN "clinic_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "accounting_periods_organization_id_idx" ON "accounting_periods"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_clinic_id_year_key" ON "accounting_periods"("clinic_id", "year");

-- CreateIndex
CREATE INDEX "accounts_clinic_id_parent_id_idx" ON "accounts"("clinic_id", "parent_id");

-- CreateIndex
CREATE INDEX "accounts_organization_id_idx" ON "accounts"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_clinic_id_code_key" ON "accounts"("clinic_id", "code");

-- CreateIndex
CREATE INDEX "financial_events_clinic_id_occurred_at_idx" ON "financial_events"("clinic_id", "occurred_at");

-- CreateIndex
CREATE INDEX "journal_entries_clinic_id_entry_date_idx" ON "journal_entries"("clinic_id", "entry_date");

-- CreateIndex
CREATE INDEX "parties_clinic_id_idx" ON "parties"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "parties_clinic_id_origin_type_origin_id_key" ON "parties"("clinic_id", "origin_type", "origin_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_events" ADD CONSTRAINT "financial_events_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

