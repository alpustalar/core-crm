/*
  Warnings:

  - Added the required column `organization_id` to the `finance_ledger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "finance_ledger" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "finance_ledger_organization_id_entry_date_idx" ON "finance_ledger"("organization_id", "entry_date");
