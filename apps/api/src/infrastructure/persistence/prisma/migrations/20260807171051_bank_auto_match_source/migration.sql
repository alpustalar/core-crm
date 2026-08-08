-- CreateEnum
CREATE TYPE "BankStatementLineMatchSource" AS ENUM ('MANUAL', 'AUTO');

-- AlterTable
ALTER TABLE "bank_statement_lines" ADD COLUMN     "match_source" "BankStatementLineMatchSource" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "bank_statement_lines_clinic_id_matched_ref_idx" ON "bank_statement_lines"("clinic_id", "matched_ref");
