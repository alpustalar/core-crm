-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BankStatementLineMatchStatus" AS ENUM ('UNMATCHED', 'MATCHED', 'IGNORED');

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "iban" TEXT,
    "account_no" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "status" "BankAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "opening_balance" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statements" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "opening_balance" DECIMAL(16,2),
    "closing_balance" DECIMAL(16,2),
    "file_name" TEXT,
    "imported_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statement_lines" (
    "id" TEXT NOT NULL,
    "bank_statement_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "balance_after" DECIMAL(16,2),
    "reference" TEXT,
    "counterparty_name" TEXT,
    "match_status" "BankStatementLineMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matched_ref" TEXT,
    "match_note" TEXT,
    "reconciled_by_id" TEXT,
    "reconciled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_statement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_clinic_id_status_idx" ON "bank_accounts"("clinic_id", "status");

-- CreateIndex
CREATE INDEX "bank_accounts_organization_id_idx" ON "bank_accounts"("organization_id");

-- CreateIndex
CREATE INDEX "bank_statements_bank_account_id_period_start_idx" ON "bank_statements"("bank_account_id", "period_start");

-- CreateIndex
CREATE INDEX "bank_statements_clinic_id_idx" ON "bank_statements"("clinic_id");

-- CreateIndex
CREATE INDEX "bank_statement_lines_bank_statement_id_idx" ON "bank_statement_lines"("bank_statement_id");

-- CreateIndex
CREATE INDEX "bank_statement_lines_bank_account_id_match_status_idx" ON "bank_statement_lines"("bank_account_id", "match_status");

-- CreateIndex
CREATE INDEX "bank_statement_lines_clinic_id_transaction_date_idx" ON "bank_statement_lines"("clinic_id", "transaction_date");

-- AddForeignKey
ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statement_lines" ADD CONSTRAINT "bank_statement_lines_bank_statement_id_fkey" FOREIGN KEY ("bank_statement_id") REFERENCES "bank_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
